<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Enums\EmailDirection;
use App\Enums\EmailMessageStatus;
use App\Events\EmailMessageReceived;
use App\Exceptions\GmailException;
use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\EmailThread;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Portal-side operations on the shared email inbox: listing threads, replying,
 * assigning reps, and the soft "delete" that keeps the audit trail intact.
 */
final class EmailInboxService
{
    public function __construct(private readonly GmailClient $gmail) {}

    /**
     * Threads visible to a user, newest activity first.
     *
     * @return LengthAwarePaginator<int, EmailThread>
     */
    public function threads(User $user, bool $archived = false, ?string $search = null, int $perPage = 30): LengthAwarePaginator
    {
        return EmailThread::query()
            ->visibleTo($user)
            ->where('is_archived', $archived)
            ->when($search !== null && $search !== '', function ($q) use ($search): void {
                $term = '%'.str_replace('%', '\%', $search).'%';
                $q->where(function ($inner) use ($term): void {
                    $inner->where('subject', 'ilike', $term)
                        ->orWhere('contact_email', 'ilike', $term)
                        ->orWhere('contact_name', 'ilike', $term);
                });
            })
            ->with(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Messages in a thread. Hidden messages are included only for auditors —
     * that is precisely the "deleted by sales still shows for admin" rule.
     *
     * @return Collection<int, EmailMessage>
     */
    public function messages(User $user, EmailThread $thread): Collection
    {
        return EmailMessage::query()
            ->where('thread_id', $thread->id)
            ->when($user->can('email.audit'), fn ($q) => $q->withTrashed())
            ->with(['sender:id,uuid,name', 'deleter:id,uuid,name', 'attachments'])
            ->orderBy('id')
            ->get();
    }

    /**
     * Reply to a thread as $sender.
     *
     * The row is written *before* the API call and updated after, so a send
     * that fails mid-flight still leaves an auditable record of what a rep
     * tried to send.
     *
     * @param  array<int, UploadedFile>  $files
     *
     * @throws GmailException
     */
    public function reply(User $sender, EmailThread $thread, string $body, array $files = []): EmailMessage
    {
        /** @var EmailMessage|null $last */
        $last = EmailMessage::query()
            ->where('thread_id', $thread->id)
            ->orderByDesc('id')
            ->first();

        $to = $this->replyRecipients($thread, $last);

        if ($to === []) {
            throw new GmailException('This thread has no recipient address to reply to.');
        }

        $subject = $this->replySubject($thread->subject);
        $messageId = $this->generateMessageId();

        /** @var EmailMessage $message */
        $message = DB::transaction(function () use ($thread, $sender, $body, $to, $subject, $messageId, $last): EmailMessage {
            $message = EmailMessage::query()->create([
                'thread_id' => $thread->id,
                'rfc_message_id' => $messageId,
                'in_reply_to' => $last?->rfc_message_id,
                'references' => $this->buildReferences($last),
                'direction' => EmailDirection::Outbound,
                'from_email' => (string) config('gmail.mailbox'),
                'from_name' => (string) config('gmail.from_name'),
                'to' => $to,
                'subject' => $subject,
                'snippet' => Str::limit(strip_tags($body), 180),
                'body_text' => $body,
                'sender_id' => $sender->id,
                'via_mail_client' => false,
                'status' => EmailMessageStatus::Queued,
                'is_read' => true,
            ]);

            $thread->forceFill(['last_message_at' => now()])->save();

            return $message;
        });

        // Store attachments locally first: the audit copy must exist even if
        // Gmail rejects the send.
        $stored = $this->storeOutboundAttachments($message, $files);

        try {
            $mime = $this->buildMime($message, $to, $subject, $body, $stored);
            $result = $this->gmail->sendRaw($mime, $thread->gmail_thread_id);

            $message->forceFill([
                'gmail_message_id' => $result['id'],
                'status' => EmailMessageStatus::Sent,
                'sent_at' => now(),
            ])->save();
        } catch (GmailException $e) {
            $message->forceFill([
                'status' => EmailMessageStatus::Failed,
                'error_message' => $e->getMessage(),
            ])->save();

            throw $e;
        } finally {
            // Broadcast either way — a failed send should appear in the thread
            // immediately, flagged, rather than vanishing.
            EmailMessageReceived::dispatch($message->fresh(['thread', 'sender']));
        }

        return $message->refresh();
    }

    /** Assign (or unassign, with null) the rep who owns a thread. */
    public function assign(EmailThread $thread, ?User $assignee): EmailThread
    {
        // Through the model, not forceFill, so activitylog records it.
        $thread->assigned_to = $assignee?->id;
        $thread->save();

        return $thread->refresh();
    }

    /**
     * Hide a message from the inbox.
     *
     * Soft only: the row, its body and its sender attribution all survive,
     * `deleted_by` records who hid it, and admins still see it. There is no
     * hard-delete path in this service.
     */
    public function hideMessage(User $actor, EmailMessage $message): EmailMessage
    {
        $message->deleted_by = $actor->id;
        $message->save();
        $message->delete();

        activity('email_message')
            ->performedOn($message)
            ->causedBy($actor)
            ->withProperties([
                'subject' => $message->subject,
                'from' => $message->from_email,
                'direction' => $message->direction->value,
            ])
            ->log('email hidden from inbox');

        return $message;
    }

    /** Restore a hidden message (admin only). */
    public function restoreMessage(User $actor, EmailMessage $message): EmailMessage
    {
        $message->restore();
        $message->deleted_by = null;
        $message->save();

        activity('email_message')
            ->performedOn($message)
            ->causedBy($actor)
            ->log('email restored to inbox');

        return $message->refresh();
    }

    /** Archive/unarchive a thread — a view-state flag, never a delete. */
    public function setArchived(User $actor, EmailThread $thread, bool $archived): EmailThread
    {
        $thread->is_archived = $archived;
        $thread->archived_by = $archived ? $actor->id : null;
        $thread->archived_at = $archived ? now() : null;
        $thread->save();

        activity('email_thread')
            ->performedOn($thread)
            ->causedBy($actor)
            ->log($archived ? 'email thread archived' : 'email thread unarchived');

        return $thread->refresh();
    }

    /** Mark a thread read for this user, and clear UNREAD in Gmail. */
    public function markRead(User $user, EmailThread $thread): void
    {
        $thread->readers()->syncWithoutDetaching([
            $user->id => ['last_read_at' => now()],
        ]);

        $unread = EmailMessage::query()
            ->where('thread_id', $thread->id)
            ->where('direction', EmailDirection::Inbound)
            ->where('is_read', false)
            ->whereNotNull('gmail_message_id')
            ->get();

        foreach ($unread as $message) {
            $this->gmail->markRead((string) $message->gmail_message_id);
            $message->forceFill(['is_read' => true])->save();
        }
    }

    /** How many inbound messages this user has not seen in a thread. */
    public function unreadCountFor(User $user, EmailThread $thread): int
    {
        $lastRead = DB::table('email_thread_reads')
            ->where('thread_id', $thread->getKey())
            ->where('user_id', $user->getKey())
            ->value('last_read_at');

        return EmailMessage::query()
            ->where('thread_id', $thread->id)
            ->where('direction', EmailDirection::Inbound)
            ->when($lastRead !== null, fn ($q) => $q->where('created_at', '>', $lastRead))
            ->count();
    }

    /**
     * Who a reply goes to: the last inbound sender, falling back to the
     * thread's recorded contact.
     *
     * @return array<int, array{email: string, name: string|null}>
     */
    private function replyRecipients(EmailThread $thread, ?EmailMessage $last): array
    {
        if ($last !== null && $last->isInbound() && $last->from_email !== null) {
            return [['email' => $last->from_email, 'name' => $last->from_name]];
        }

        if ($thread->contact_email !== null) {
            return [['email' => $thread->contact_email, 'name' => $thread->contact_name]];
        }

        return [];
    }

    /** "Re:" once, not "Re: Re: Re:". */
    private function replySubject(?string $subject): string
    {
        $subject = trim((string) $subject);

        if ($subject === '') {
            return 'Re: (no subject)';
        }

        return Str::startsWith(Str::lower($subject), 're:') ? $subject : "Re: {$subject}";
    }

    /**
     * Build the References chain so the customer's mail client threads the
     * reply correctly instead of starting a new conversation.
     */
    private function buildReferences(?EmailMessage $last): ?string
    {
        if ($last === null) {
            return null;
        }

        $refs = array_filter([
            trim((string) $last->references),
            trim((string) $last->rfc_message_id),
        ]);

        return $refs === [] ? null : implode(' ', $refs);
    }

    /** A globally-unique Message-ID rooted at the mailbox's domain. */
    private function generateMessageId(): string
    {
        $mailbox = (string) config('gmail.mailbox');
        $domain = str_contains($mailbox, '@') ? Str::after($mailbox, '@') : 'localhost';

        return '<'.Str::uuid()->toString().'@'.$domain.'>';
    }

    /**
     * Assemble an RFC 5322 message, multipart when there are attachments.
     *
     * @param  array<int, array{email: string, name: string|null}>  $to
     * @param  array<int, EmailAttachment>  $attachments
     */
    private function buildMime(
        EmailMessage $message,
        array $to,
        string $subject,
        string $body,
        array $attachments,
    ): string {
        $fromName = (string) config('gmail.from_name');
        $fromEmail = (string) config('gmail.mailbox');

        $headers = [
            'From: '.$this->encodeAddress($fromEmail, $fromName),
            'To: '.implode(', ', array_map(
                fn (array $a): string => $this->encodeAddress($a['email'], $a['name']),
                $to,
            )),
            'Subject: '.$this->encodeHeaderValue($subject),
            'Message-ID: '.$message->rfc_message_id,
            'MIME-Version: 1.0',
        ];

        if ($message->in_reply_to !== null) {
            $headers[] = 'In-Reply-To: '.$message->in_reply_to;
        }

        if ($message->references !== null) {
            $headers[] = 'References: '.$message->references;
        }

        if ($attachments === []) {
            $headers[] = 'Content-Type: text/plain; charset="UTF-8"';
            $headers[] = 'Content-Transfer-Encoding: base64';

            return implode("\r\n", $headers)."\r\n\r\n".chunk_split(base64_encode($body), 76, "\r\n");
        }

        $boundary = 'bnd_'.Str::random(24);
        $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

        $parts = [
            "--{$boundary}",
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: base64',
            '',
            chunk_split(base64_encode($body), 76, "\r\n"),
        ];

        foreach ($attachments as $attachment) {
            if (!$attachment->isStored()) {
                continue;
            }

            $bytes = Storage::disk((string) $attachment->disk)->get((string) $attachment->path);

            if ($bytes === null) {
                continue;
            }

            $parts[] = "--{$boundary}";
            $parts[] = 'Content-Type: '.($attachment->mime_type ?? 'application/octet-stream')
                .'; name="'.$attachment->filename.'"';
            $parts[] = 'Content-Disposition: attachment; filename="'.$attachment->filename.'"';
            $parts[] = 'Content-Transfer-Encoding: base64';
            $parts[] = '';
            $parts[] = chunk_split(base64_encode($bytes), 76, "\r\n");
        }

        $parts[] = "--{$boundary}--";

        return implode("\r\n", $headers)."\r\n\r\n".implode("\r\n", $parts);
    }

    /** RFC 2047-encode a display name only when it needs it. */
    private function encodeAddress(string $email, ?string $name): string
    {
        if ($name === null || trim($name) === '') {
            return $email;
        }

        return $this->encodeHeaderValue($name)." <{$email}>";
    }

    private function encodeHeaderValue(string $value): string
    {
        if (preg_match('/^[\x20-\x7E]*$/', $value) === 1) {
            return $value;
        }

        return '=?UTF-8?B?'.base64_encode($value).'?=';
    }

    /**
     * Persist outbound attachments to the private disk before sending.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, EmailAttachment>
     */
    private function storeOutboundAttachments(EmailMessage $message, array $files): array
    {
        if ($files === []) {
            return [];
        }

        $disk = (string) config('gmail.attachments.disk', 'local');
        $dir = trim((string) config('gmail.attachments.directory', 'email'), '/');
        $records = [];

        foreach ($files as $file) {
            $path = $file->store("{$dir}/outbound/{$message->uuid}", $disk);

            $records[] = EmailAttachment::query()->create([
                'message_id' => $message->id,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'disk' => $disk,
                'path' => $path,
            ]);
        }

        return $records;
    }
}
