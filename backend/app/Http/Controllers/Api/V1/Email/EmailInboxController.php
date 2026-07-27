<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Email;

use App\Exceptions\GmailException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Email\SendEmailRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\EmailMessageResource;
use App\Http\Resources\EmailThreadResource;
use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\User;
use App\Services\Email\EmailInboxService;
use App\Services\Email\GmailClient;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Portal-facing email inbox. Thin: resolve → policy → service → resource.
 *
 * Threads bind by uuid. Every mutating endpoint runs through the policy, and
 * the only "delete" available anywhere is the soft hide in
 * {@see EmailInboxService::hideMessage()}.
 */
final class EmailInboxController extends Controller
{
    // The project's base Controller is bare (Laravel 11+ default), so the
    // authorization helpers are pulled in here rather than globally.
    use AuthorizesRequests;

    public function __construct(
        private readonly EmailInboxService $inbox,
        private readonly GmailClient $gmail,
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
        $this->authorize('viewAny', EmailThread::class);

        $user = $this->actor($request);

        $paginator = $this->inbox->threads(
            $user,
            archived: $request->boolean('archived'),
            search: $request->string('search')->toString() ?: null,
            perPage: min((int) $request->integer('perPage', 30), 100),
        );

        foreach ($paginator->items() as $thread) {
            $thread->setAttribute('unread_count', $this->inbox->unreadCountFor($user, $thread));
        }

        $state = DB::table('email_sync_state')
            ->where('mailbox', (string) config('gmail.mailbox'))
            ->first();

        return ApiResponse::collection(
            EmailThreadResource::collection($paginator->items())->resolve($request),
            $paginator,
            [
                'configured' => $this->gmail->isConfigured(),
                'mailbox' => config('gmail.mailbox'),
                'lastSyncedAt' => $state->last_synced_at ?? null,
                'lastError' => $state->last_error ?? null,
            ],
        );
    }

    /** A single thread's header details. */
    public function show(Request $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('view', $thread);

        $user = $this->actor($request);
        $thread->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);
        $thread->setAttribute('unread_count', $this->inbox->unreadCountFor($user, $thread));

        return ApiResponse::item(
            (new EmailThreadResource($thread))->resolve($request),
        );
    }

    /**
     * Messages in a thread. Opening it marks the thread read for this user and
     * clears UNREAD in Gmail so the mailbox stays in step.
     */
    public function messages(Request $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('view', $thread);

        $user = $this->actor($request);
        $messages = $this->inbox->messages($user, $thread);

        $this->inbox->markRead($user, $thread);

        return ApiResponse::collection(
            EmailMessageResource::collection($messages)->resolve($request),
        );
    }

    /** Reply to a thread. */
    public function send(SendEmailRequest $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('send', $thread);

        try {
            $message = $this->inbox->reply(
                $this->actor($request),
                $thread,
                (string) $request->validated('body'),
                array_values($request->file('files') ?? []),
            );
        } catch (GmailException $e) {
            return ApiResponse::error('email_send_failed', $e->getMessage(), 422);
        }

        $message->load(['sender:id,uuid,name', 'attachments']);

        return ApiResponse::item(
            (new EmailMessageResource($message))->resolve($request),
            201,
        );
    }

    /** Claim a thread, hand it over, or return it to the shared queue. */
    public function assign(Request $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('assign', $thread);

        $validated = $request->validate([
            'userId' => ['present', 'nullable', 'string', 'exists:users,uuid'],
        ]);

        $assignee = $validated['userId'] === null
            ? null
            : User::query()->where('uuid', $validated['userId'])->firstOrFail();

        $thread = $this->inbox->assign($thread, $assignee);
        $thread->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);

        return ApiResponse::item(
            (new EmailThreadResource($thread))->resolve($request),
        );
    }

    /** Archive or unarchive a thread. Never deletes anything. */
    public function archive(Request $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('archive', $thread);

        $thread = $this->inbox->setArchived(
            $this->actor($request),
            $thread,
            $request->boolean('archived', true),
        );
        $thread->load(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage']);

        return ApiResponse::item(
            (new EmailThreadResource($thread))->resolve($request),
        );
    }

    /** Explicitly mark a thread read without loading its messages. */
    public function markRead(Request $request, EmailThread $thread): JsonResponse
    {
        $this->authorize('view', $thread);

        $this->inbox->markRead($this->actor($request), $thread);

        return ApiResponse::item(['read' => true]);
    }

    /**
     * Hide a message from the inbox.
     *
     * Soft only. The row, its body and its sender attribution survive, and
     * admins continue to see it in the thread and in the audit log.
     */
    public function hideMessage(Request $request, EmailMessage $message): JsonResponse
    {
        $message->load('thread');
        $this->authorize('hideMessage', $message->thread);

        $this->inbox->hideMessage($this->actor($request), $message);

        return ApiResponse::item([
            'hidden' => true,
            'note' => 'Email hidden from the inbox. It remains in the database and in the admin audit log.',
        ]);
    }

    /** Restore a hidden message (auditors only). */
    public function restoreMessage(Request $request, string $uuid): JsonResponse
    {
        $this->authorize('audit', EmailThread::class);

        /** @var EmailMessage $message */
        $message = EmailMessage::withTrashed()->where('uuid', $uuid)->firstOrFail();

        $this->inbox->restoreMessage($this->actor($request), $message);

        return ApiResponse::item(
            (new EmailMessageResource($message->fresh(['sender', 'deleter', 'attachments'])))->resolve($request),
        );
    }

    /** Download an attachment from the private disk. */
    public function downloadAttachment(Request $request, EmailAttachment $attachment): StreamedResponse
    {
        $attachment->load('message.thread');
        $this->authorize('view', $attachment->message->thread);

        abort_if(!$attachment->isStored(), 404);

        return Storage::disk((string) $attachment->disk)
            ->download((string) $attachment->path, $attachment->filename ?? 'attachment');
    }

    // ---- Admin oversight ----

    /**
     * Every email a rep has hidden, across all threads — the "deleted by sales
     * but still visible to admin" view.
     */
    public function hiddenMessages(Request $request): JsonResponse
    {
        $this->authorize('audit', EmailThread::class);

        $paginator = EmailMessage::onlyTrashed()
            ->with(['sender:id,uuid,name', 'deleter:id,uuid,name', 'thread:id,uuid,subject,contact_email'])
            ->orderByDesc('deleted_at')
            ->paginate(min((int) $request->integer('perPage', 30), 100));

        return ApiResponse::collection(
            EmailMessageResource::collection($paginator->items())->resolve($request),
            $paginator,
        );
    }

    /**
     * The activity log for email records: sends, hides, restores,
     * reassignments and archives, with the causing user attached.
     */
    public function auditLog(Request $request): JsonResponse
    {
        $this->authorize('audit', EmailThread::class);

        $paginator = Activity::query()
            ->whereIn('log_name', ['email_message', 'email_thread'])
            ->with('causer')
            ->latest('id')
            ->paginate(min((int) $request->integer('perPage', 50), 200));

        return ApiResponse::collection(
            ActivityResource::collection($paginator->items())->resolve($request),
            $paginator,
        );
    }
}
