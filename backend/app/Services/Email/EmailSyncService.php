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
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Pulls mail from Gmail into the portal.
 *
 * Two rules, mirroring the WhatsApp webhook processor:
 *  1. **Idempotent.** Dedup is on the unique `gmail_message_id`, so re-running
 *     a sync (or overlapping runs) cannot duplicate a message.
 *  2. **Never throw for one bad message.** A single unparseable email is
 *     logged and skipped; the rest of the batch still lands.
 */
final class EmailSyncService
{
    public function __construct(private readonly GmailClient $gmail) {}

    /**
     * Run one sync pass.
     *
     * @return array{fetched: int, stored: int, skipped: int}
     *
     * @throws GmailException on auth/config failure — the caller reports it
     */
    public function sync(?int $max = null): array
    {
        $max ??= (int) config('gmail.sync.max_per_run', 50);
        $query = $this->buildQuery();

        $listing = $this->gmail->listMessages($query, $max);

        $stored = 0;
        $skipped = 0;

        foreach ($listing['ids'] as $id) {
            // Cheap pre-check avoids a full fetch for mail we already hold —
            // by far the common case on a 1-minute poll.
            if (EmailMessage::withTrashed()->where('gmail_message_id', $id)->exists()) {
                $skipped++;

                continue;
            }

            try {
                if ($this->ingest($this->gmail->getMessage($id))) {
                    $stored++;
                } else {
                    $skipped++;
                }
            } catch (Throwable $e) {
                $skipped++;
                Log::error('Gmail message ingest failed.', [
                    'gmailMessageId' => $id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->recordSuccess();

        return ['fetched' => count($listing['ids']), 'stored' => $stored, 'skipped' => $skipped];
    }

    /**
     * Store one Gmail message.
     *
     * @param  array<string, mixed>  $raw
     */
    public function ingest(array $raw): bool
    {
        $gmailId = (string) ($raw['id'] ?? '');
        $threadId = (string) ($raw['threadId'] ?? '');

        if ($gmailId === '' || $threadId === '') {
            return false;
        }

        $headers = $this->headers($raw['payload']['headers'] ?? []);
        $from = $this->parseAddress($headers['from'] ?? '');
        $mailbox = strtolower((string) config('gmail.mailbox'));

        // Direction is decided by the sender, not by Gmail's labels: labels
        // vary with filters, the From header does not.
        $outbound = $from['email'] !== null && strtolower($from['email']) === $mailbox;
        $direction = $outbound ? EmailDirection::Outbound : EmailDirection::Inbound;

        $sentAt = isset($raw['internalDate'])
            ? Carbon::createFromTimestampMs((int) $raw['internalDate'])
            : now();

        $body = $this->extractBody($raw['payload'] ?? []);
        $to = $this->parseAddressList($headers['to'] ?? '');
        $cc = $this->parseAddressList($headers['cc'] ?? '');

        // The counterpart is whoever is not us.
        $counterpart = $outbound ? ($to[0] ?? ['email' => null, 'name' => null]) : $from;

        try {
            $message = DB::transaction(function () use (
                $raw, $gmailId, $threadId, $headers, $from, $to, $cc,
                $direction, $outbound, $sentAt, $body, $counterpart
            ): EmailMessage {
                $thread = $this->resolveThread($threadId, (string) ($headers['subject'] ?? ''), $counterpart);

                $message = EmailMessage::query()->create([
                    'thread_id' => $thread->id,
                    'gmail_message_id' => $gmailId,
                    'rfc_message_id' => $headers['message-id'] ?? null,
                    'in_reply_to' => $headers['in-reply-to'] ?? null,
                    'references' => $headers['references'] ?? null,
                    'direction' => $direction,
                    'from_email' => $from['email'],
                    'from_name' => $from['name'],
                    'to' => $to,
                    'cc' => $cc,
                    'subject' => $headers['subject'] ?? null,
                    'snippet' => isset($raw['snippet']) ? html_entity_decode((string) $raw['snippet']) : null,
                    'body_text' => $body['text'],
                    'body_html' => $body['html'],
                    // Mail sent from Gmail itself has no portal author. The
                    // portal's own sends set sender_id when they are created,
                    // and are skipped here by the dedup check.
                    'sender_id' => null,
                    'via_mail_client' => $outbound,
                    'status' => $outbound ? EmailMessageStatus::Sent : EmailMessageStatus::Received,
                    'sent_at' => $sentAt,
                    'payload' => ['headers' => $headers, 'labelIds' => $raw['labelIds'] ?? []],
                ]);

                $thread->forceFill([
                    'last_message_at' => $sentAt,
                    'last_inbound_at' => $direction === EmailDirection::Inbound
                        ? $sentAt
                        : $thread->last_inbound_at,
                    'message_count' => $thread->messages()->count(),
                    // New mail pulls an archived thread back into the inbox.
                    'is_archived' => false,
                    'archived_at' => null,
                    'archived_by' => null,
                ])->save();

                return $message;
            });
        } catch (QueryException $e) {
            // Lost the unique-index race with a concurrent sync. Benign.
            Log::info('Gmail duplicate message ignored.', ['gmailMessageId' => $gmailId]);

            return false;
        }

        $this->mirrorAttachments($message, $raw['payload'] ?? []);

        EmailMessageReceived::dispatch($message->fresh(['thread', 'sender']));

        return true;
    }

    /**
     * Find or create the thread, linking it to a portal user when matched.
     *
     * @param  array{email: string|null, name: string|null}  $counterpart
     */
    private function resolveThread(string $gmailThreadId, string $subject, array $counterpart): EmailThread
    {
        $thread = EmailThread::query()->firstOrCreate(
            ['gmail_thread_id' => $gmailThreadId],
            [
                'subject' => $subject !== '' ? $subject : '(no subject)',
                'contact_email' => $counterpart['email'],
                'contact_name' => $counterpart['name'],
                'user_id' => $this->matchPortalUser($counterpart['email'])?->id,
            ],
        );

        // Backfill a contact discovered on a later message in the thread.
        if ($thread->contact_email === null && $counterpart['email'] !== null) {
            $thread->forceFill([
                'contact_email' => $counterpart['email'],
                'contact_name' => $counterpart['name'],
                'user_id' => $this->matchPortalUser($counterpart['email'])?->id,
            ])->save();
        }

        return $thread;
    }

    /** Match a sender address to a portal user, case-insensitively. */
    private function matchPortalUser(?string $email): ?User
    {
        if ($email === null || $email === '') {
            return null;
        }

        return User::query()->whereRaw('lower(email) = ?', [strtolower($email)])->first();
    }

    /**
     * Flatten Gmail's header array into a lowercase-keyed map.
     *
     * @param  array<int, array{name?: string, value?: string}>  $headers
     * @return array<string, string>
     */
    private function headers(array $headers): array
    {
        $out = [];

        foreach ($headers as $h) {
            if (isset($h['name'], $h['value'])) {
                $out[strtolower((string) $h['name'])] = (string) $h['value'];
            }
        }

        return $out;
    }

    /**
     * Walk the MIME tree for the text and HTML bodies.
     *
     * Gmail nests parts arbitrarily (multipart/alternative inside
     * multipart/mixed inside…), so this recurses rather than assuming a shape.
     *
     * @param  array<string, mixed>  $payload
     * @return array{text: string|null, html: string|null}
     */
    private function extractBody(array $payload): array
    {
        $text = null;
        $html = null;

        $walk = function (array $part) use (&$walk, &$text, &$html): void {
            $mime = (string) ($part['mimeType'] ?? '');
            $data = $part['body']['data'] ?? null;

            if (is_string($data) && $data !== '') {
                $decoded = base64_decode(strtr($data, '-_', '+/'), true);

                if ($decoded !== false) {
                    if ($mime === 'text/plain' && $text === null) {
                        $text = $decoded;
                    } elseif ($mime === 'text/html' && $html === null) {
                        $html = $decoded;
                    }
                }
            }

            foreach ($part['parts'] ?? [] as $child) {
                if (is_array($child)) {
                    $walk($child);
                }
            }
        };

        $walk($payload);

        return [
            'text' => $text,
            'html' => $html === null ? null : $this->sanitizeHtml($html),
        ];
    }

    /**
     * Strip the actively dangerous parts of an HTML email body.
     *
     * Defence in depth only — the frontend additionally renders this inside a
     * sandboxed iframe, which is what actually contains it. Email HTML is too
     * varied to whitelist safely without a full parser.
     */
    private function sanitizeHtml(string $html): string
    {
        // Whole elements that execute or load code.
        $html = preg_replace('#<\s*(script|style|iframe|object|embed|link|meta|base)\b[^>]*>.*?<\s*/\s*\1\s*>#is', '', $html) ?? $html;
        $html = preg_replace('#<\s*(script|style|iframe|object|embed|link|meta|base)\b[^>]*/?>#is', '', $html) ?? $html;
        // Inline event handlers: on*="…" / on*='…' / on*=bare.
        $html = preg_replace('#\son[a-z]+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]+)#is', '', $html) ?? $html;
        // javascript:/vbscript: URLs.
        $html = preg_replace('#(href|src|action)\s*=\s*(["\']?)\s*(?:javascript|vbscript|data:text/html)\s*:[^"\'>\s]*\2#is', '$1="#"', $html) ?? $html;

        return $html;
    }

    /**
     * Parse a single address header into name + email.
     *
     * @return array{email: string|null, name: string|null}
     */
    private function parseAddress(string $header): array
    {
        $header = trim($header);

        if ($header === '') {
            return ['email' => null, 'name' => null];
        }

        // "Display Name" <a@b.com>  |  Display Name <a@b.com>  |  a@b.com
        if (preg_match('/^\s*(?:"?([^"<]*?)"?\s*)?<\s*([^>]+)\s*>\s*$/', $header, $m) === 1) {
            $name = trim($m[1]);

            return [
                'email' => trim($m[2]) ?: null,
                'name' => $name !== '' ? $this->decodeMimeWords($name) : null,
            ];
        }

        return ['email' => $header, 'name' => null];
    }

    /**
     * Parse a comma-separated address list.
     *
     * @return array<int, array{email: string|null, name: string|null}>
     */
    private function parseAddressList(string $header): array
    {
        if (trim($header) === '') {
            return [];
        }

        // Split on commas that are not inside quotes.
        $parts = preg_split('/,(?=(?:[^"]*"[^"]*")*[^"]*$)/', $header) ?: [];
        $out = [];

        foreach ($parts as $part) {
            $parsed = $this->parseAddress($part);

            if ($parsed['email'] !== null) {
                $out[] = $parsed;
            }
        }

        return $out;
    }

    /**
     * Decode RFC 2047 encoded-words (=?UTF-8?B?…?=) that appear in display
     * names, so non-ASCII senders are not shown as mojibake.
     */
    private function decodeMimeWords(string $value): string
    {
        if (!str_contains($value, '=?')) {
            return $value;
        }

        $decoded = @iconv_mime_decode($value, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');

        return $decoded === false ? $value : $decoded;
    }

    /**
     * Mirror attachments onto the private disk.
     *
     * A rep deleting mail in Gmail must not erase portal evidence, so the
     * bytes are copied locally rather than linked.
     *
     * @param  array<string, mixed>  $payload
     */
    private function mirrorAttachments(EmailMessage $message, array $payload): void
    {
        $found = [];

        $walk = function (array $part) use (&$walk, &$found): void {
            $filename = (string) ($part['filename'] ?? '');
            $attachmentId = $part['body']['attachmentId'] ?? null;

            if ($filename !== '' && is_string($attachmentId)) {
                $found[] = [
                    'attachmentId' => $attachmentId,
                    'filename' => $filename,
                    'mimeType' => (string) ($part['mimeType'] ?? 'application/octet-stream'),
                    'size' => (int) ($part['body']['size'] ?? 0),
                ];
            }

            foreach ($part['parts'] ?? [] as $child) {
                if (is_array($child)) {
                    $walk($child);
                }
            }
        };

        $walk($payload);

        $disk = (string) config('gmail.attachments.disk', 'local');
        $dir = trim((string) config('gmail.attachments.directory', 'email'), '/');
        $max = (int) config('gmail.attachments.max_bytes', 26214400);

        foreach ($found as $meta) {
            $record = EmailAttachment::query()->create([
                'message_id' => $message->id,
                'gmail_attachment_id' => $meta['attachmentId'],
                'filename' => $meta['filename'],
                'mime_type' => $meta['mimeType'],
                'size' => $meta['size'],
            ]);

            if ($meta['size'] > $max) {
                Log::warning('Email attachment exceeds max_bytes; metadata kept, file skipped.', [
                    'message' => $message->uuid,
                    'filename' => $meta['filename'],
                    'size' => $meta['size'],
                ]);

                continue;
            }

            try {
                $bytes = $this->gmail->getAttachment(
                    (string) $message->gmail_message_id,
                    $meta['attachmentId'],
                );

                $path = "{$dir}/{$message->uuid}/".$this->safeFilename($meta['filename']);
                Storage::disk($disk)->put($path, $bytes);

                $record->forceFill([
                    'disk' => $disk,
                    'path' => $path,
                    'size' => strlen($bytes),
                ])->save();
            } catch (Throwable $e) {
                // Metadata and gmail_attachment_id survive, so it can be
                // re-fetched later.
                Log::error('Email attachment mirroring failed.', [
                    'message' => $message->uuid,
                    'filename' => $meta['filename'],
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /** Keep a filename usable as a path segment without losing readability. */
    private function safeFilename(string $name): string
    {
        $name = preg_replace('/[^\w.\- ]+/u', '_', $name) ?? 'attachment';

        return trim(substr($name, 0, 120)) ?: 'attachment';
    }

    /** Gmail search query bounding the first (and every) sync. */
    private function buildQuery(): string
    {
        $query = (string) config('gmail.sync.query', '');
        $days = (int) config('gmail.sync.backfill_days', 30);

        if ($days > 0) {
            $query = trim($query.' newer_than:'.$days.'d');
        }

        return $query;
    }

    /** Record a successful pass for staleness reporting. */
    private function recordSuccess(): void
    {
        if (!Schema::hasTable('email_sync_state')) {
            return;
        }

        DB::table('email_sync_state')->updateOrInsert(
            ['mailbox' => (string) config('gmail.mailbox')],
            ['last_synced_at' => now(), 'last_error' => null, 'updated_at' => now(), 'created_at' => now()],
        );
    }

    /** Record a failed pass so the UI can show the inbox is stale. */
    public function recordFailure(string $error): void
    {
        if (!Schema::hasTable('email_sync_state')) {
            return;
        }

        DB::table('email_sync_state')->updateOrInsert(
            ['mailbox' => (string) config('gmail.mailbox')],
            ['last_error' => $error, 'updated_at' => now(), 'created_at' => now()],
        );
    }
}
