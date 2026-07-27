<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Exceptions\GmailException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Mints Google OAuth access tokens for the shared mailbox.
 *
 * Google permanently disabled Basic Auth and App Passwords for Workspace
 * IMAP/SMTP in May 2025, so OAuth is the only route in. Two grant types are
 * supported (see config/gmail.php):
 *
 *  - service_account: a signed JWT assertion, impersonating the mailbox via
 *    domain-wide delegation. No human in the loop, nothing to re-consent.
 *  - refresh_token: the classic installed-app flow.
 *
 * Access tokens last an hour; they are cached just short of that so a burst of
 * API calls does not mint one per request.
 */
final class GoogleTokenProvider
{
    private const CACHE_KEY = 'gmail.access_token';

    /**
     * A valid bearer token for the configured mailbox.
     *
     * @throws GmailException
     */
    public function accessToken(): string
    {
        $cached = Cache::get(self::CACHE_KEY);

        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $mode = (string) config('gmail.auth_mode', 'service_account');

        $token = match ($mode) {
            'service_account' => $this->fromServiceAccount(),
            'refresh_token' => $this->fromRefreshToken(),
            default => throw new GmailException("Unknown GMAIL_AUTH_MODE '{$mode}'."),
        };

        // Expire a minute early to avoid using a token that dies mid-flight.
        Cache::put(self::CACHE_KEY, $token['access_token'], max(60, $token['expires_in'] - 60));

        return $token['access_token'];
    }

    /** Drop the cached token — used when Google rejects it as expired. */
    public function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /** Is the integration configured enough to attempt a call? */
    public function isConfigured(): bool
    {
        if (blank(config('gmail.mailbox'))) {
            return false;
        }

        return match ((string) config('gmail.auth_mode')) {
            'service_account' => $this->serviceAccountCredentials() !== null,
            'refresh_token' => filled(config('gmail.oauth.refresh_token'))
                && filled(config('gmail.oauth.client_id')),
            default => false,
        };
    }

    /**
     * Service-account flow: sign a JWT and exchange it for an access token.
     *
     * @return array{access_token: string, expires_in: int}
     *
     * @throws GmailException
     */
    private function fromServiceAccount(): array
    {
        $creds = $this->serviceAccountCredentials();

        if ($creds === null) {
            throw new GmailException('Gmail service-account credentials are not configured.');
        }

        $mailbox = (string) config('gmail.mailbox');

        if ($mailbox === '') {
            throw new GmailException('GMAIL_MAILBOX is not configured.');
        }

        $now = time();
        $claims = [
            'iss' => $creds['client_email'],
            // Domain-wide delegation: act as the shared mailbox.
            'sub' => $mailbox,
            'scope' => implode(' ', (array) config('gmail.scopes', [])),
            'aud' => (string) config('gmail.endpoints.token'),
            'iat' => $now,
            'exp' => $now + 3600,
        ];

        $assertion = $this->signJwt($claims, $creds['private_key']);

        return $this->exchange([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ]);
    }

    /**
     * Installed-app flow: trade a stored refresh token for an access token.
     *
     * @return array{access_token: string, expires_in: int}
     *
     * @throws GmailException
     */
    private function fromRefreshToken(): array
    {
        return $this->exchange([
            'grant_type' => 'refresh_token',
            'client_id' => (string) config('gmail.oauth.client_id'),
            'client_secret' => (string) config('gmail.oauth.client_secret'),
            'refresh_token' => (string) config('gmail.oauth.refresh_token'),
        ]);
    }

    /**
     * POST the token endpoint and normalise the response.
     *
     * @param  array<string, string>  $form
     * @return array{access_token: string, expires_in: int}
     *
     * @throws GmailException
     */
    private function exchange(array $form): array
    {
        $response = Http::asForm()
            ->timeout((int) config('gmail.timeout', 20))
            ->connectTimeout((int) config('gmail.connect_timeout', 5))
            ->post((string) config('gmail.endpoints.token'), $form);

        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];

        if ($response->failed() || !isset($data['access_token'])) {
            $reason = (string) ($data['error'] ?? 'unknown_error');
            $detail = (string) ($data['error_description'] ?? 'Google rejected the token request.');

            throw new GmailException(
                "Google OAuth failed ({$reason}): {$detail}",
                $reason,
                $response->status(),
            );
        }

        return [
            'access_token' => (string) $data['access_token'],
            'expires_in' => (int) ($data['expires_in'] ?? 3600),
        ];
    }

    /**
     * RS256-sign a JWT. Google's assertion format is a plain signed JWT, so
     * this avoids pulling in a JWT library for ~15 lines of work.
     *
     * @param  array<string, mixed>  $claims
     *
     * @throws GmailException
     */
    private function signJwt(array $claims, string $privateKey): string
    {
        $encode = static fn (array $part): string => rtrim(
            strtr(base64_encode(json_encode($part, JSON_UNESCAPED_SLASHES) ?: ''), '+/', '-_'),
            '=',
        );

        $signingInput = $encode(['alg' => 'RS256', 'typ' => 'JWT']).'.'.$encode($claims);

        $key = openssl_pkey_get_private($privateKey);

        if ($key === false) {
            throw new GmailException('Gmail private key could not be parsed. Check GMAIL_PRIVATE_KEY / the credentials file.');
        }

        $signature = '';

        if (!openssl_sign($signingInput, $signature, $key, OPENSSL_ALGO_SHA256)) {
            throw new GmailException('Failed to sign the Google JWT assertion.');
        }

        return $signingInput.'.'.rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    }

    /**
     * Resolve service-account credentials from either the JSON key file or the
     * inline env pair.
     *
     * @return array{client_email: string, private_key: string}|null
     */
    private function serviceAccountCredentials(): ?array
    {
        $path = (string) config('gmail.service_account.credentials_path');

        if ($path !== '' && is_readable($path)) {
            /** @var array<string, mixed> $json */
            $json = json_decode((string) file_get_contents($path), true) ?: [];

            if (filled($json['client_email'] ?? null) && filled($json['private_key'] ?? null)) {
                return [
                    'client_email' => (string) $json['client_email'],
                    'private_key' => (string) $json['private_key'],
                ];
            }
        }

        $email = (string) config('gmail.service_account.client_email');
        $key = (string) config('gmail.service_account.private_key');

        if ($email === '' || $key === '') {
            return null;
        }

        return [
            'client_email' => $email,
            // .env cannot hold real newlines, so the key is pasted with \n
            // escapes and normalised here.
            'private_key' => str_replace('\n', "\n", $key),
        ];
    }
}
