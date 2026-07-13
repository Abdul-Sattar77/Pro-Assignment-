<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Messages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Messages\StoreMessageRequest;
use App\Http\Requests\Messages\UpdateMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Services\Messages\MessageService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MessageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly MessageService $service,
        private readonly ConversationRepositoryInterface $conversations,
        private readonly MessageRepositoryInterface $messages,
    ) {}

    /**
     * Get conversations listing.
     */
    public function conversations(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Message::class);

        $search = $request->query('search');
        $type = $request->query('type');

        $list = $this->conversations->getFilteredFor(
            $this->actor($request),
            [
                'search' => is_string($search) ? $search : null,
                'type' => is_string($type) ? $type : null,
            ]
        );

        return ApiResponse::resource(ConversationResource::collection($list));
    }

    /**
     * Get message history for a conversation.
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        // Mark as read when loading history
        $this->service->markAsRead($conversation, $this->actor($request));

        $history = $this->messages->getChronologicalFor($conversation->getKey());

        return ApiResponse::resource(MessageResource::collection($history));
    }

    /**
     * Send a message.
     */
    public function store(StoreMessageRequest $request): JsonResponse
    {
        /** @var array{assignmentId: string, type: string, message?: string|null, attachmentId?: string|null} $data */
        $data = $request->validated();

        // Authorize if actor has access to target workflow channel.
        // We look up or mock a conversation stub to delegate authorization to the policy.
        $assignmentRepo = app(\App\Repositories\Contracts\AssignmentRepositoryInterface::class);
        $assignment = $assignmentRepo->findByUuid($data['assignmentId']);
        if ($assignment === null) {
            return ApiResponse::error('ASSIGNMENT_NOT_FOUND', 'The requested assignment does not exist.', 404);
        }

        $conversation = Conversation::query()
            ->where('assignment_id', $assignment->getKey())
            ->where('type', $data['type'])
            ->first();

        if ($conversation !== null) {
            $this->authorize('create', $conversation);
        } else {
            // Check authorization rules on mock model to avoid creating record prematurely.
            $mockConversation = new Conversation([
                'assignment_id' => $assignment->getKey(),
                'type' => $data['type'],
            ]);
            $mockConversation->assignment = $assignment;
            $this->authorize('create', $mockConversation);
        }

        $message = $this->service->sendMessage($this->actor($request), $data);

        return ApiResponse::resource(MessageResource::make($message->load(['sender', 'attachment'])), 201);
    }

    /**
     * Edit/update a message.
     */
    public function update(UpdateMessageRequest $request, Message $message): JsonResponse
    {
        $this->authorize('delete', $message); // Enforce uploader or PM/Admin constraints

        /** @var array{message: string} $data */
        $data = $request->validated();

        $updated = $this->service->updateMessage($message, $data['message']);

        return ApiResponse::resource(MessageResource::make($updated->load(['sender', 'attachment'])));
    }

    /**
     * Delete a message.
     */
    public function destroy(Request $request, Message $message): JsonResponse
    {
        $this->authorize('delete', $message);

        $this->service->deleteMessage($message, $this->actor($request));

        return response()->json(['message' => 'Message deleted successfully.']);
    }

    /**
     * Get total global unread count badge.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->conversations->getUnreadCountFor($this->actor($request));

        return response()->json(['count' => $count]);
    }

    /**
     * Get conversations for a specific assignment.
     */
    public function assignmentConversations(Request $request, string $assignmentUuid): JsonResponse
    {
        $this->authorize('viewAny', Message::class);

        $assignmentRepo = app(\App\Repositories\Contracts\AssignmentRepositoryInterface::class);
        $assignment = $assignmentRepo->findByUuid($assignmentUuid);
        if ($assignment === null) {
            return ApiResponse::error('ASSIGNMENT_NOT_FOUND', 'The requested assignment does not exist.', 404);
        }

        $list = $this->conversations->getFilteredFor(
            $this->actor($request),
            [
                'assignment_id' => $assignment->getKey(),
            ]
        );

        return ApiResponse::resource(ConversationResource::collection($list));
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
