<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Exceptions\GmailException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin client for the Gmail REST API.
 *
 * Deliberately knows nothing about the portal's models — it speaks Gmail and
 * returns arrays. Domain behaviour lives in {@see EmailSyncService} and
 * {@see EmailInboxService}. Mirrors the shape of WhatsAppCloudApi so the two
 * integrations read the same way.
 *
 * @see https://developers.google.com/gmail/api/reference/rest
 */
final class GmailClient
{
    public function __construct(private readonly GoogleTokenProvider $tokens) {}

    public function isConfigured(): bool
    {
        return $this->tokens->isConfigured();
    }

    /**
     * List message ids matching a Gmail search query, newest first.
     *
     * @return array{ids: array<int, string>, nextPageToken: string|null}
     *
     * @throws GmailException
     */
    public function listMessages(string $query, int $max = 50, ?string $pageToken = null): array
    {
        $data = $this->decode(
            $this->request()->get($this->url('messages'), array_filter([
                'q' => $query,
                'maxResults' => $max,
                'pageToken' => $pageToken,
            ])),
            'list messages',
        );

        $ids = [];

        foreach ($data['messages'] ?? [] as $m) {
            if (isset($m['id']) && is_string($m['id'])) {
                $ids[] = $m['id'];
            }
        }

        return [
            'ids' => $ids,
            'nextPageToken' => isset($data['nextPageToken']) ? (string) $data['nextPageToken'] : null,
        ];
    }

    /**
     * Fetch one message in full (headers + body parts).
     *
     * @return array<string, mixed>
     *
     * @throws GmailException
     */
    public function getMessage(string $id): array
    {
        return $this->decode(
            $this->request()->get($this->url("messages/{$id}"), ['format' => 'full']),
            'get message',
        );
    }

    /**
     * Download an attachment's bytes.
     *
     * @throws GmailException
     */
    public function getAttachment(string $messageId, string $attachmentId): string
    {
        $data = $this->decode(
            $this->request()->get($this->url("messages/{$messageId}/attachments/{$attachmentId}")),
            'get attachment',
        );

        $encoded = (string) ($data['data'] ?? '');

        if ($encoded === '') {
            throw new GmailException('Attachment returned no data.');
        }

        $bytes = base64_decode(strtr($encoded, '-_', '+/'), true);

        if ($bytes === false) {
            throw new GmailException('Attachment data was not valid base64url.');
        }

        return $bytes;
    }

    /**
     * Send a raw RFC 5322 message, optionally into an existing thread.
     *
     * @return array{id: string|null, threadId: string|null}
     *
     * @throws GmailException
     */
    public function sendRaw(string $mime, ?string $threadId = null): array
    {
        $payload = ['raw' => rtrim(strtr(base64_encode($mime), '+/', '-_'), '=')];

        if ($threadId !== null) {
            $payload['threadId'] = $threadId;
        }

        $data = $this->decode(
            $this->request()->post($this->url('messages/send'), $payload),
            'send message',
        );

        return [
            'id' => isset($data['id']) ? (string) $data['id'] : null,
            'threadId' => isset($data['threadId']) ? (string) $data['threadId'] : null,
        ];
    }

    /**
     * Remove the UNREAD label so the mailbox reflects what the portal has read.
     *
     * Best-effort: never block opening a thread because Gmail hiccuped.
     */
    public function markRead(string $messageId): bool
    {
        try {
            $response = $this->request()->post($this->url("messages/{$messageId}/modify"), [
                'removeLabelIds' => ['UNREAD'],
            ]);

            return $response->successful();
        } catch (GmailException $e) {
            Log::warning('Gmail mark-read failed.', [
                'messageId' => $messageId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * The mailbox profile — used as a cheap credentials smoke test.
     *
     * @return array<string, mixed>
     */
    public function profile(): array
    {
        return $this->decode($this->request()->get($this->url('profile')), 'get profile');
    }

    /**
     * Decode a Gmail response, translating its error envelope.
     *
     * @return array<string, mixed>
     *
     * @throws GmailException
     */
    private function decode(Response $response, string $action): array
    {
        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];

        if ($response->successful() && !isset($data['error'])) {
            return $data;
        }

        $error = is_array($data['error'] ?? null) ? $data['error'] : [];
        $message = (string) ($error['message'] ?? "Gmail API call failed ({$action}).");
        $reason = (string) ($error['errors'][0]['reason'] ?? $error['status'] ?? 'unknown');

        // A rejected token is usually just an expired cache entry; drop it so
        // the next attempt mints a fresh one.
        if (in_array($response->status(), [401, 403], true)) {
            $this->tokens->forget();
        }

        Log::error('Gmail API error.', [
            'action' => $action,
            'status' => $response->status(),
            'reason' => $reason,
            'message' => $message,
        ]);

        throw new GmailException($message, $reason, $response->status());
    }

    private function request(): PendingRequest
    {
        return Http::withToken($this->tokens->accessToken())
            ->timeout((int) config('gmail.timeout', 20))
            ->connectTimeout((int) config('gmail.connect_timeout', 5))
            // Gmail 429s and 5xxs are transient; two quick retries smooth them.
            ->retry(2, 300, throw: false)
            ->acceptJson();
    }

    /** All calls act on the authenticated mailbox ("me"). */
    private function url(string $path): string
    {
        $base = rtrim((string) config('gmail.endpoints.api'), '/');

        return "{$base}/users/me/{$path}";
    }
}
