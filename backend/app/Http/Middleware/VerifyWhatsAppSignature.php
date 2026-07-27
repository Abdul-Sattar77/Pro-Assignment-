<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Validates Meta's `X-Hub-Signature-256` HMAC on inbound webhook requests.
 *
 * The webhook URL is necessarily public and unauthenticated, so without this
 * anyone who learns it could inject fabricated customer messages into the
 * inbox. The HMAC is computed over the *raw* body — re-encoding the parsed
 * JSON would change byte-for-byte content and never match.
 */
final class VerifyWhatsAppSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('whatsapp.verify_signature', true)) {
            return $next($request);
        }

        $secret = (string) config('whatsapp.app_secret');

        if ($secret === '') {
            Log::error('WhatsApp webhook rejected: WHATSAPP_APP_SECRET is not configured.');

            return response()->json(['message' => 'Webhook signature verification is not configured.'], 500);
        }

        $header = (string) $request->header('X-Hub-Signature-256', '');

        if (!str_starts_with($header, 'sha256=')) {
            return $this->reject($request, 'missing or malformed signature header');
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        // Constant-time compare: a plain === leaks the signature via timing.
        if (!hash_equals($expected, substr($header, 7))) {
            return $this->reject($request, 'signature mismatch');
        }

        return $next($request);
    }

    private function reject(Request $request, string $reason): Response
    {
        Log::warning('WhatsApp webhook signature rejected.', [
            'reason' => $reason,
            'ip' => $request->ip(),
        ]);

        return response()->json(['message' => 'Invalid signature.'], 403);
    }
}
