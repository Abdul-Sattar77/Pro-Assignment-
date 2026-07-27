<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Gmail / Google Workspace mailbox
|--------------------------------------------------------------------------
| Powers the portal's shared email inbox. See
| docs/architecture/email-integration.md for the setup runbook.
|
| Auth note: Google permanently disabled Basic Auth and App Passwords for
| Workspace IMAP/SMTP in May 2025, so OAuth is the only route. Two modes are
| supported — pick ONE:
|
|   service_account  A Workspace admin grants domain-wide delegation once.
|                    No user interaction, no token to re-consent. Preferred
|                    for a shared company mailbox.
|   refresh_token    The mailbox owner consents once in a browser and the
|                    resulting refresh token is stored here. Use when you
|                    cannot get admin cooperation.
*/

return [
    /*
    | 'service_account' | 'refresh_token'
    */
    'auth_mode' => env('GMAIL_AUTH_MODE', 'service_account'),

    /*
    | The mailbox being read, e.g. info@yourcompany.com. Under domain-wide
    | delegation this is also the account the service account impersonates.
    */
    'mailbox' => env('GMAIL_MAILBOX'),

    /*
    | Display name used on outbound replies.
    */
    'from_name' => env('GMAIL_FROM_NAME', env('APP_NAME', 'Support')),

    /*
    | --- service_account mode ---
    | Path to the downloaded JSON key, OR the client email + private key
    | inline (handy on hosts where you cannot place files).
    */
    'service_account' => [
        'credentials_path' => env('GMAIL_CREDENTIALS_PATH'),
        'client_email' => env('GMAIL_CLIENT_EMAIL'),
        // Keep the literal \n escapes when pasting into .env; they are
        // normalised before signing.
        'private_key' => env('GMAIL_PRIVATE_KEY'),
    ],

    /*
    | --- refresh_token mode ---
    */
    'oauth' => [
        'client_id' => env('GMAIL_CLIENT_ID'),
        'client_secret' => env('GMAIL_CLIENT_SECRET'),
        'refresh_token' => env('GMAIL_REFRESH_TOKEN'),
    ],

    /*
    | Scopes. `gmail.modify` covers read, send, and label changes (marking
    | read). Narrower than full mail access, which Google reviews harder.
    */
    'scopes' => [
        'https://www.googleapis.com/auth/gmail.modify',
    ],

    'endpoints' => [
        'token' => 'https://oauth2.googleapis.com/token',
        'api' => 'https://gmail.googleapis.com/gmail/v1',
    ],

    /*
    | Sync behaviour.
    |  - query: Gmail search syntax limiting what the portal ingests. The
    |    default skips spam/trash and Google's promo tabs, which would
    |    otherwise flood a sales inbox.
    |  - max_per_run: cap per polling cycle so a backlog cannot stall the job.
    |  - backfill_days: how far back the very first sync reaches.
    */
    'sync' => [
        'query' => env('GMAIL_SYNC_QUERY', '-in:chats -in:spam -in:trash -category:promotions -category:social'),
        'max_per_run' => (int) env('GMAIL_SYNC_MAX', 50),
        'backfill_days' => (int) env('GMAIL_BACKFILL_DAYS', 30),
        // Minutes between scheduled polls.
        'interval_minutes' => (int) env('GMAIL_SYNC_INTERVAL', 1),
    ],

    /*
    | Attachments are mirrored to the private disk so the audit trail survives
    | independently of the mailbox (a rep deleting mail in Gmail must not
    | erase portal evidence).
    */
    'attachments' => [
        'disk' => env('GMAIL_ATTACHMENT_DISK', 'local'),
        'directory' => env('GMAIL_ATTACHMENT_DIR', 'email'),
        'max_bytes' => (int) env('GMAIL_ATTACHMENT_MAX_BYTES', 26214400), // 25 MB
    ],

    'timeout' => (int) env('GMAIL_TIMEOUT', 20),
    'connect_timeout' => (int) env('GMAIL_CONNECT_TIMEOUT', 5),
];
