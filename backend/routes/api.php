<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Users\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| Versioned under /api/v1 (docs/api/api-standards.md §1). Each module adds
| its own route group here. Keep controllers thin; logic lives in services.
*/

Route::prefix('v1')->group(function (): void {
    // ---- Identity & Authentication ----
    Route::prefix('auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('me', [AuthController::class, 'me'])->name('auth.me');
        });
    });

    // ---- User Management (admin provisioning) ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('users', UserController::class)
            ->parameters(['users' => 'user'])
            ->names('users');
    });
});
