<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Exceptions\WhatsAppException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Thin, stateless client for Meta's WhatsApp Business Cloud API.
 *
 * Deliberately knows nothing about the portal's models — it speaks Graph API
 * and returns arrays. Domain behaviour lives in {@see WhatsAppInboxService}.
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */
final class WhatsAppCloudApi
{
    /** Is the integration configured well enough to attempt a call? */
    public function isConfigured(): bool
    {
        return filled(config('whatsapp.phone_number_id'))
            && filled(config('whatsapp.access_token'));
    }

    /**
     * Send a free-form text message.
     *
     * Only deliverable inside the 24-hour customer service window; outside it
     * Meta rejects the call with error 131047 and {@see sendTemplate} is the
     * only path. Free of charge for customer-initiated service conversations.
     *
     * @return array{wamid: string|null, raw: array<string, mixed>}
     */
    public function sendText(string $waId, string $body, ?string $replyToWamid = null): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $waId,
            'type' => 'text',
            // preview_url renders link cards; harmless and expected by users.
            'text' => ['preview_url' => true, 'body' => $body],
        ];

        if ($replyToWamid !== null) {
            $payload['context'] = ['message_id' => $replyToWamid];
        }

        return $this->dispatchMessage($payload);
    }

    /**
     * Send a pre-approved template message.
     *
     * This is the billable, business-initiated path used to reopen a thread
     * after the free window has closed.
     *
     * @param  array<int, string>  $bodyParameters  positional {{1}}, {{2}} values
     * @return array{wamid: string|null, raw: array<string, mixed>}
     */
    public function sendTemplate(
        string $waId,
        string $templateName,
        string $language,
        array $bodyParameters = [],
    ): array {
        $template = [
            'name' => $templateName,
            'language' => ['code' => $language],
        ];

        if ($bodyParameters !== []) {
            $template['components'] = [[
                'type' => 'body',
                'parameters' => array_map(
                    static fn (string $text): array => ['type' => 'text', 'text' => $text],
                    array_values($bodyParameters),
                ),
            ]];
        }

        return $this->dispatchMessage([
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $waId,
            'type' => 'template',
            'template' => $template,
        ]);
    }

    /**
     * Send a media message from an already-uploaded Meta media id.
     *
     * @return array{wamid: string|null, raw: array<string, mixed>}
     */
    public function sendMedia(
        string $waId,
        string $type,
        string $mediaId,
        ?string $caption = null,
        ?string $filename = null,
    ): array {
        $media = ['id' => $mediaId];

        // Only document and image accept a caption; sending one on audio is a
        // hard 400 from Meta rather than a silently ignored field.
        if ($caption !== null && in_array($type, ['image', 'document', 'video'], true)) {
            $media['caption'] = $caption;
        }

        if ($filename !== null && $type === 'document') {
            $media['filename'] = $filename;
        }

        return $this->dispatchMessage([
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $waId,
            'type' => $type,
            $type => $media,
        ]);
    }

    /**
     * Upload a local file to Meta, returning the reusable media id.
     *
     * @throws WhatsAppException
     */
    public function uploadMedia(string $absolutePath, string $mimeType, string $filename): string
    {
        $response = $this->request()
            ->attach('file', file_get_contents($absolutePath), $filename, ['Content-Type' => $mimeType])
            ->post($this->url($this->phoneNumberId().'/media'), [
                'messaging_product' => 'whatsapp',
                'type' => $mimeType,
            ]);

        $data = $this->decode($response, 'upload media');

        $id = $data['id'] ?? null;

        if (!is_string($id) || $id === '') {
            throw new WhatsAppException('Media upload succeeded but returned no media id.');
        }

        return $id;
    }

    /**
     * Resolve a media id to its (short-lived, authenticated) download URL.
     *
     * @return array{url: string, mime_type: string|null, file_size: int|null, sha256: string|null}
     *
     * @throws WhatsAppException
     */
    public function fetchMediaMetadata(string $mediaId): array
    {
        $data = $this->decode(
            $this->request()->get($this->url($mediaId)),
            'fetch media metadata',
        );

        $url = $data['url'] ?? null;

        if (!is_string($url) || $url === '') {
            throw new WhatsAppException("Media {$mediaId} has no download URL.");
        }

        return [
            'url' => $url,
            'mime_type' => isset($data['mime_type']) ? (string) $data['mime_type'] : null,
            'file_size' => isset($data['file_size']) ? (int) $data['file_size'] : null,
            'sha256' => isset($data['sha256']) ? (string) $data['sha256'] : null,
        ];
    }

    /**
     * Download media bytes. The URL from {@see fetchMediaMetadata} still
     * requires the bearer token — it is not a public link.
     *
     * @throws WhatsAppException
     */
    public function downloadMedia(string $url): string
    {
        $response = $this->request()->withOptions(['stream' => false])->get($url);

        if ($response->failed()) {
            throw new WhatsAppException(
                "Failed to download WhatsApp media (HTTP {$response->status()}).",
                status: $response->status(),
            );
        }

        return $response->body();
    }

    /**
     * Mark an inbound message read (blue ticks for the customer).
     *
     * Best-effort: a failure here must never block opening a thread, so it is
     * logged and swallowed rather than thrown.
     */
    public function markRead(string $wamid): bool
    {
        try {
            $response = $this->request()->post($this->url($this->phoneNumberId().'/messages'), [
                'messaging_product' => 'whatsapp',
                'status' => 'read',
                'message_id' => $wamid,
            ]);

            return $response->successful();
        } catch (Throwable $e) {
            Log::warning('WhatsApp read receipt failed.', [
                'wamid' => $wamid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * POST a message envelope and pull the resulting wamid out of the reply.
     *
     * @param  array<string, mixed>  $payload
     * @return array{wamid: string|null, raw: array<string, mixed>}
     *
     * @throws WhatsAppException
     */
    private function dispatchMessage(array $payload): array
    {
        $data = $this->decode(
            $this->request()->post($this->url($this->phoneNumberId().'/messages'), $payload),
            'send message',
        );

        return [
            'wamid' => $data['messages'][0]['id'] ?? null,
            'raw' => $data,
        ];
    }

    /**
     * Turn a Graph response into an array, translating Meta's error envelope
     * into a {@see WhatsAppException} that carries its numeric code.
     *
     * @return array<string, mixed>
     *
     * @throws WhatsAppException
     */
    private function decode(Response $response, string $action): array
    {
        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];

        if ($response->successful() && !isset($data['error'])) {
            return $data;
        }

        $error = is_array($data['error'] ?? null) ? $data['error'] : [];
        $code = isset($error['code']) ? (string) $error['code'] : null;
        $message = (string) ($error['error_data']['details']
            ?? $error['message']
            ?? "WhatsApp API call failed ({$action}).");

        Log::error('WhatsApp Cloud API error.', [
            'action' => $action,
            'status' => $response->status(),
            'code' => $code,
            'message' => $message,
        ]);

        throw new WhatsAppException($message, $code, $response->status());
    }

    /** A configured, token-bearing HTTP client. */
    private function request(): PendingRequest
    {
        $token = (string) config('whatsapp.access_token');

        if ($token === '') {
            throw new WhatsAppException('WHATSAPP_ACCESS_TOKEN is not configured.');
        }

        return Http::withToken($token)
            ->timeout((int) config('whatsapp.timeout', 15))
            ->connectTimeout((int) config('whatsapp.connect_timeout', 5))
            // Meta 500s and 429s are transient; two quick retries avoid
            // surfacing a spurious failure to the rep.
            ->retry(2, 250, throw: false)
            ->acceptJson();
    }

    private function url(string $path): string
    {
        $base = (string) config('whatsapp.base_url', 'https://graph.facebook.com');
        $version = (string) config('whatsapp.api_version', 'v21.0');

        // Media download URLs come back fully qualified already.
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return "{$base}/{$version}/{$path}";
    }

    private function phoneNumberId(): string
    {
        $id = (string) config('whatsapp.phone_number_id');

        if ($id === '') {
            throw new WhatsAppException('WHATSAPP_PHONE_NUMBER_ID is not configured.');
        }

        return $id;
    }
}
