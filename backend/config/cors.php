<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS)
|--------------------------------------------------------------------------
| Allows the Next.js frontend to call the API with credentials (Sanctum
| cookie auth). `supports_credentials` MUST be true and the origin explicit
| (no wildcard) for cookies to be accepted by the browser.
| See docs/api/api-standards.md §14 and §12.
*/

return [
    'paths' => ['api/*', 'login', 'logout'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
