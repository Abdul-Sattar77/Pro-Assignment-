<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Default Application Currency
    |--------------------------------------------------------------------------
    |
    | Centralized currency code and display symbol used across Finance, Reports,
    | Dashboard, and Analytics services.
    |
    */
    'currency' => env('APP_CURRENCY', 'PKR'),
    'currency_symbol' => env('APP_CURRENCY_SYMBOL', 'PKR '),
];
