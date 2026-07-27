<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| WhatsApp Business Cloud API
|--------------------------------------------------------------------------
| Credentials for the Meta Cloud API integration that powers the portal
| inbox. See docs/architecture/whatsapp-integration.md for the setup runbook.
|
| Cost note: replies inside the 24-hour customer service window are free of
| charge. Business-initiated messages require an approved template and are
| billed by Meta — see `templates` below.
*/

return [
    /*
    | Graph API host + version. Pin the version: Meta ships breaking changes
    | between versions and unpinned calls follow the account default.
    */
    'base_url' => rtrim((string) env('WHATSAPP_BASE_URL', 'https://graph.facebook.com'), '/'),
    'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),

    /*
    | The Cloud API phone number registered to the business number, and the
    | WhatsApp Business Account (WABA) that owns it. Both come from the
    | Meta App dashboard → WhatsApp → API Setup.
    */
    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID'),

    /*
    | Permanent System User access token. Temporary tokens from the dashboard
    | expire in 24h and are only useful for a first smoke test.
    */
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),

    /*
    | Webhook security.
    |  - verify_token: an arbitrary secret you also type into the Meta
    |    dashboard; echoed back during the GET handshake.
    |  - app_secret: used to validate the X-Hub-Signature-256 HMAC on every
    |    inbound POST so third parties cannot forge messages into the inbox.
    */
    'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
    'app_secret' => env('WHATSAPP_APP_SECRET'),

    /*
    | Reject unsigned/incorrectly-signed webhook payloads. Only disable in
    | local development where you are replaying captured payloads by hand.
    */
    'verify_signature' => (bool) env('WHATSAPP_VERIFY_SIGNATURE', true),

    /*
    | Meta's customer service window. Free-form replies are only deliverable
    | (and free) within this many hours of the contact's last inbound message.
    | Outside it, Meta rejects free-form text and a template must be used.
    */
    'service_window_hours' => (int) env('WHATSAPP_SERVICE_WINDOW_HOURS', 24),

    /*
    | Mark inbound messages as read (blue ticks) when a portal user opens the
    | thread. Purely cosmetic for the contact; costs nothing.
    */
    'send_read_receipts' => (bool) env('WHATSAPP_SEND_READ_RECEIPTS', true),

    /*
    | Media handling. Meta stores inbound media for 30 days behind an
    | authenticated URL, so the portal mirrors it onto the private disk to
    | keep the audit trail intact after Meta expires the original.
    */
    'media' => [
        'disk' => env('WHATSAPP_MEDIA_DISK', 'local'),
        'directory' => env('WHATSAPP_MEDIA_DIR', 'whatsapp'),
        // Meta's own inbound cap is 16 MB for video/audio, 100 MB documents.
        'max_bytes' => (int) env('WHATSAPP_MEDIA_MAX_BYTES', 104857600),
    ],

    /*
    | Business-initiated (paid) templates. Only used when a rep replies
    | outside the service window; the UI warns before this path is taken.
    */
    'templates' => [
        'reopen' => [
            'name' => env('WHATSAPP_TEMPLATE_REOPEN', 'service_followup'),
            'language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'en'),
        ],
    ],

    /*
    | HTTP timeouts (seconds) for outbound Graph API calls.
    */
    'timeout' => (int) env('WHATSAPP_TIMEOUT', 15),
    'connect_timeout' => (int) env('WHATSAPP_CONNECT_TIMEOUT', 5),
];
