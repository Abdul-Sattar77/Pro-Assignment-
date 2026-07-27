<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\WhatsApp;

use App\Exceptions\WhatsAppException;
use App\Http\Controllers\Controller;
use App\Http\Requests\WhatsApp\AssignWhatsAppThreadRequest;
use App\Http\Requests\WhatsApp\SendWhatsAppMessageRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\WhatsAppConversationResource;
use App\Http\Resources\WhatsAppMessageResource;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppMessage;
use App\Services\WhatsApp\WhatsAppCloudApi;
use App\Services\WhatsApp\WhatsAppInboxService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Portal-facing WhatsApp inbox. Thin: resolve → policy → service → resource.
 *
 * Threads bind by uuid. Every mutating endpoint runs through the policy, and
 * the only "delete" available anywhere is the soft hide in
 * {@see WhatsAppInboxService::hideMessage()}.
 */
final class WhatsAppInboxController extends Controller
{
    // The project's base Controller is bare (Laravel 11+ default), so the
    // authorization helpers are pulled in here rather than globally.
    use AuthorizesRequests;

    public function __construct(
        private readonly WhatsAppInboxService $inbox,
        private readonly WhatsAppCloudApi $api,
    ) {}

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }

    /** Threads visible to the viewer, newest activity first. */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', WhatsAppContact::class);

        $user = $this->actor($request);

        $paginator = $this->inbox->conversations(
            $user,
            archived: $request->boolean('archived'),
            search: $request->string('search')->toString() ?: null,
            perPage: min((int) $request->integer('perPage', 30), 100),
        );

        foreach ($paginator->items() as $contact) {
            $contact->setAttribute('unread_count', $this->inbox->unreadCountFor($user, $contact));
        }

        return ApiResponse::collection(
            WhatsAppConversationResource::collection($paginator->items())->resolve($request),
            $paginator,
            ['configured' => $this->api->isConfigured()],
        );
    }

    /** A single thread's header details. */
    public function show(Request $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('view', $contact);

        $user = $this->actor($request);
        $contact->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);
        $contact->setAttribute('unread_count', $this->inbox->unreadCountFor($user, $contact));

        return ApiResponse::item(
            (new WhatsAppConversationResource($contact))->resolve($request),
        );
    }

    /**
     * Messages in a thread. Opening a thread marks it read for this user and
     * sends a read receipt to the customer.
     */
    public function messages(Request $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('view', $contact);

        $user = $this->actor($request);
        $messages = $this->inbox->messages($user, $contact);

        $this->inbox->markRead($user, $contact);

        return ApiResponse::collection(
            WhatsAppMessageResource::collection($messages)->resolve($request),
            null,
            [
                'withinServiceWindow' => $contact->isWithinServiceWindow(),
                'serviceWindowExpiresAt' => $contact->serviceWindowExpiresAt()?->toIso8601String(),
            ],
        );
    }

    /**
     * Reply to a thread.
     *
     * A closed service window comes back as 422 with `code: template_required`
     * so the UI can offer the billable template path explicitly rather than
     * silently spending the client's money.
     */
    public function send(SendWhatsAppMessageRequest $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('send', $contact);

        try {
            $message = $this->inbox->reply(
                $this->actor($request),
                $contact,
                (string) $request->validated('body', ''),
                $request->file('file'),
            );
        } catch (WhatsAppException $e) {
            return ApiResponse::error(
                $e->requiresTemplate() ? 'template_required' : 'whatsapp_send_failed',
                $e->requiresTemplate()
                    ? 'The 24-hour reply window has closed. Send an approved template to reopen the conversation.'
                    : $e->getMessage(),
                422,
            );
        }

        $message->load('sender:id,uuid,name');

        return ApiResponse::item(
            (new WhatsAppMessageResource($message))->resolve($request),
            201,
        );
    }

    /** Send the billable re-engagement template to reopen a closed window. */
    public function sendTemplate(Request $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('send', $contact);

        $validated = $request->validate([
            'parameters' => ['array', 'max:10'],
            'parameters.*' => ['string', 'max:1024'],
        ]);

        try {
            $message = $this->inbox->sendReopenTemplate(
                $this->actor($request),
                $contact,
                $validated['parameters'] ?? [],
            );
        } catch (WhatsAppException $e) {
            return ApiResponse::error('whatsapp_send_failed', $e->getMessage(), 422);
        }

        $message->load('sender:id,uuid,name');

        return ApiResponse::item(
            (new WhatsAppMessageResource($message))->resolve($request),
            201,
        );
    }

    /** Claim a thread, hand it over, or return it to the shared queue. */
    public function assign(AssignWhatsAppThreadRequest $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('assign', $contact);

        $uuid = $request->validated('userId');
        $assignee = $uuid === null
            ? null
            : User::query()->where('uuid', $uuid)->firstOrFail();

        $contact = $this->inbox->assign($contact, $assignee);
        $contact->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);

        return ApiResponse::item(
            (new WhatsAppConversationResource($contact))->resolve($request),
        );
    }

    /** Archive or unarchive a thread. Never deletes anything. */
    public function archive(Request $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('archive', $contact);

        $archived = $request->boolean('archived', true);
        $contact = $this->inbox->setArchived($this->actor($request), $contact, $archived);
        $contact->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);

        return ApiResponse::item(
            (new WhatsAppConversationResource($contact))->resolve($request),
        );
    }

    /** Explicitly mark a thread read without loading its messages. */
    public function markRead(Request $request, WhatsAppContact $contact): JsonResponse
    {
        $this->authorize('view', $contact);

        $this->inbox->markRead($this->actor($request), $contact);

        return ApiResponse::item(['read' => true]);
    }

    /**
     * Hide a message from the inbox.
     *
     * Soft only. The row, its body and its sender attribution survive, and
     * admins continue to see it in the thread and in the audit log.
     */
    public function hideMessage(Request $request, WhatsAppMessage $message): JsonResponse
    {
        $message->load('contact');
        $this->authorize('hideMessage', $message->contact);

        $this->inbox->hideMessage($this->actor($request), $message);

        return ApiResponse::item([
            'hidden' => true,
            'note' => 'Message hidden from the inbox. It remains in the database and in the admin audit log.',
        ]);
    }

    /** Restore a hidden message (auditors only). */
    public function restoreMessage(Request $request, string $uuid): JsonResponse
    {
        $this->authorize('audit', WhatsAppContact::class);

        /** @var WhatsAppMessage $message */
        $message = WhatsAppMessage::withTrashed()->where('uuid', $uuid)->firstOrFail();

        $this->inbox->restoreMessage($this->actor($request), $message);

        return ApiResponse::item(
            (new WhatsAppMessageResource($message->fresh(['sender', 'deleter'])))->resolve($request),
        );
    }

    /** Download an attachment from the private disk. */
    public function download(Request $request, WhatsAppMessage $message): StreamedResponse
    {
        $message->load('contact');
        $this->authorize('view', $message->contact);

        abort_if($message->path === null || $message->disk === null, 404);

        return Storage::disk($message->disk)
            ->download($message->path, $message->original_name ?? 'attachment');
    }

    // ---- Admin oversight ----

    /**
     * Every message a rep has hidden, across all threads — the "deleted by
     * sales but still visible to admin" view.
     */
    public function hiddenMessages(Request $request): JsonResponse
    {
        $this->authorize('audit', WhatsAppContact::class);

        $paginator = WhatsAppMessage::onlyTrashed()
            ->with(['sender:id,uuid,name', 'deleter:id,uuid,name', 'contact:id,uuid,wa_id,profile_name'])
            ->orderByDesc('deleted_at')
            ->paginate(min((int) $request->integer('perPage', 30), 100));

        return ApiResponse::collection(
            WhatsAppMessageResource::collection($paginator->items())->resolve($request),
            $paginator,
        );
    }

    /**
     * The activity log for WhatsApp records: sends, hides, restores,
     * reassignments and archives, with the causing user attached.
     */
    public function auditLog(Request $request): JsonResponse
    {
        $this->authorize('audit', WhatsAppContact::class);

        $paginator = Activity::query()
            ->whereIn('log_name', ['whatsapp_message', 'whatsapp_contact'])
            ->with('causer')
            ->latest('id')
            ->paginate(min((int) $request->integer('perPage', 50), 200));

        return ApiResponse::collection(
            ActivityResource::collection($paginator->items())->resolve($request),
            $paginator,
        );
    }
}
