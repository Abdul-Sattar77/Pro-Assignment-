<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\WhatsApp;

use App\Http\Controllers\Controller;
use App\Http\Middleware\VerifyWhatsAppSignature;
use App\Services\WhatsApp\WhatsAppWebhookProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Meta's public webhook endpoint.
 *
 * Unauthenticated by necessity — Meta's servers call it. Authenticity is
 * established by {@see VerifyWhatsAppSignature} on the POST route and by the
 * verify token on the GET handshake.
 */
final class WhatsAppWebhookController extends Controller
{
    /**
     * Subscription handshake.
     *
     * Meta GETs this once when the webhook is saved in the dashboard and
     * expects `hub.challenge` echoed back verbatim as plain text.
     */
    public function verify(Request $request): Response
    {
        $mode = (string) $request->query('hub_mode', $request->query('hub.mode', ''));
        $token = (string) $request->query('hub_verify_token', $request->query('hub.verify_token', ''));
        $challenge = (string) $request->query('hub_challenge', $request->query('hub.challenge', ''));

        $expected = (string) config('whatsapp.verify_token');

        if ($mode !== 'subscribe' || $expected === '' || !hash_equals($expected, $token)) {
            Log::warning('WhatsApp webhook verification failed.', [
                'mode' => $mode,
                'ip' => $request->ip(),
            ]);

            return response('Forbidden', 403);
        }

        // Must be the bare challenge string — any JSON wrapper fails the check.
        return response($challenge, 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Receive messages and delivery statuses.
     *
     * Always answers 200. Meta retries any non-2xx for hours and disables the
     * webhook after sustained failures, so processing errors are logged
     * internally rather than signalled back — {@see WhatsAppWebhookProcessor}
     * is idempotent and dedups on wamid, so nothing is lost by acknowledging.
     */
    public function handle(Request $request, WhatsAppWebhookProcessor $processor): JsonResponse
    {
        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        try {
            $result = $processor->process($payload);

            if (array_sum($result) > 0) {
                Log::info('WhatsApp webhook processed.', $result);
            }
        } catch (Throwable $e) {
            Log::error('WhatsApp webhook processing threw.', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);
        }

        return response()->json(['received' => true]);
    }
}
