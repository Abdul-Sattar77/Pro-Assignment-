<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Chat;

use App\Events\CallSignal;
use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\SendChatMessageRequest;
use App\Http\Requests\Chat\StartConversationRequest;
use App\Http\Requests\Chat\UpdateChatPoliciesRequest;
use App\Http\Resources\ChatContactResource;
use App\Http\Resources\ChatConversationResource;
use App\Http\Resources\ChatMessageResource;
use App\Http\Resources\ChatPolicyResource;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\User;
use App\Services\Chat\ChatService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Direct (cross-role) messaging endpoints. Thin: resolve → service → resource.
 * Conversations and messages bind by uuid (HasUuid).
 */
final class ChatController extends Controller
{
    public function __construct(private readonly ChatService $chat) {}

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }

    /** People the viewer may start a chat with. */
    public function contacts(Request $request): AnonymousResourceCollection
    {
        $contacts = $this->chat->contactsFor($this->actor($request))->load('roles');

        return ChatContactResource::collection($contacts);
    }

    /** The viewer's conversations, newest activity first. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->actor($request);

        $conversations = ChatConversation::query()
            ->whereHas('participants', fn ($q) => $q->where('users.id', $user->getKey()))
            ->with(['participants.roles', 'latestMessage'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        foreach ($conversations as $conversation) {
            $conversation->setAttribute('unread_count', $this->chat->unreadCount($user, $conversation));
        }

        return ChatConversationResource::collection($conversations);
    }

    /** Start (or fetch) a 1:1 conversation with another user. */
    public function store(StartConversationRequest $request): JsonResponse
    {
        /** @var string $userUuid */
        $userUuid = $request->validated('userId');
        $target = User::query()->where('uuid', $userUuid)->firstOrFail();

        $conversation = $this->chat->getOrCreateDirect($this->actor($request), $target);
        $conversation->load(['participants.roles', 'latestMessage']);
        $conversation->setAttribute('unread_count', 0);

        return ApiResponse::resource(ChatConversationResource::make($conversation), 201);
    }

    /** Messages in a conversation (participant or admin). Marks read for participants. */
    public function messages(Request $request, ChatConversation $conversation): AnonymousResourceCollection
    {
        $user = $this->actor($request);
        $this->authorizeView($user, $conversation);

        if ($this->chat->isParticipant($user, $conversation)) {
            $this->chat->markRead($user, $conversation);
        }

        $messages = $conversation->messages()->with('sender')->get();

        return ChatMessageResource::collection($messages);
    }

    public function send(SendChatMessageRequest $request, ChatConversation $conversation): JsonResponse
    {
        $body = $request->validated('body');
        $message = $this->chat->send(
            $this->actor($request),
            $conversation,
            is_string($body) ? $body : null,
            $request->file('file'),
        );

        return ApiResponse::resource(ChatMessageResource::make($message), 201);
    }

    public function read(Request $request, ChatConversation $conversation): JsonResponse
    {
        $user = $this->actor($request);
        if ($this->chat->isParticipant($user, $conversation)) {
            $this->chat->markRead($user, $conversation);
        }

        return response()->json(null, 204);
    }

    /** Relay a WebRTC signaling message to the other participant. */
    public function signal(Request $request, ChatConversation $conversation): JsonResponse
    {
        $user = $this->actor($request);
        abort_unless($this->chat->isParticipant($user, $conversation), 403);

        /** @var array{type: string, media?: string|null, payload?: mixed} $data */
        $data = $request->validate([
            'type' => ['required', 'string', 'in:offer,answer,ice,hangup,reject'],
            'media' => ['nullable', 'string', 'in:audio,video'],
            'payload' => ['nullable'],
        ]);

        $other = $conversation->participants()
            ->where('users.id', '!=', $user->getKey())
            ->first();

        if ($other !== null) {
            broadcast(new CallSignal($other->uuid, [
                'type' => $data['type'],
                'conversationId' => $conversation->uuid,
                'from' => ['id' => $user->uuid, 'name' => $user->name],
                'media' => $data['media'] ?? 'video',
                'payload' => $data['payload'] ?? null,
            ]));
        }

        return response()->json(null, 202);
    }

    /** Stream an attachment (participant or admin). */
    public function download(Request $request, ChatMessage $message): StreamedResponse
    {
        $message->load('conversation');
        $this->authorizeView($this->actor($request), $message->conversation);

        abort_if($message->path === null || $message->disk === null, 404);

        return Storage::disk($message->disk)
            ->download($message->path, $message->original_name ?? 'attachment');
    }

    // ---- Admin: oversight + matrix ----

    public function adminConversations(Request $request): AnonymousResourceCollection
    {
        $this->assertAdmin($this->actor($request));

        $conversations = ChatConversation::query()
            ->with(['participants.roles', 'latestMessage'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        return ChatConversationResource::collection($conversations);
    }

    public function adminMessages(Request $request, ChatConversation $conversation): AnonymousResourceCollection
    {
        $this->assertAdmin($this->actor($request));

        $messages = $conversation->messages()->with('sender')->get();

        return ChatMessageResource::collection($messages);
    }

    public function policies(Request $request): AnonymousResourceCollection
    {
        $this->assertAdmin($this->actor($request));

        return ChatPolicyResource::collection($this->chat->policies());
    }

    public function updatePolicies(UpdateChatPoliciesRequest $request): AnonymousResourceCollection
    {
        /** @var array<int, array{role_a: string, role_b: string, allowed: bool}> $policies */
        $policies = $request->validated('policies');
        $this->chat->updatePolicies($policies);

        return ChatPolicyResource::collection($this->chat->policies());
    }

    private function authorizeView(User $user, ChatConversation $conversation): void
    {
        if ($this->chat->isAdmin($user) || $this->chat->isParticipant($user, $conversation)) {
            return;
        }
        abort(403, 'You cannot view this conversation.');
    }

    private function assertAdmin(User $user): void
    {
        abort_unless($this->chat->isAdmin($user), 403, 'Admins only.');
    }
}
