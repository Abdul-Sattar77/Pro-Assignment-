<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Assignments\AssignmentController;
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

    // ---- Assignments (workflow) ----
    Route::middleware('auth:sanctum')->prefix('assignments')->name('assignments.')->group(function (): void {
        Route::get('/', [AssignmentController::class, 'index'])->name('index');
        Route::post('/', [AssignmentController::class, 'store'])->name('store');
        Route::get('{assignment}', [AssignmentController::class, 'show'])->name('show');

        // Workflow actions (verbs as sub-paths per api-standards §11)
        Route::post('{assignment}/assign', [AssignmentController::class, 'assign'])->name('assign');
        Route::post('{assignment}/accept', [AssignmentController::class, 'accept'])->name('accept');
        Route::post('{assignment}/reject', [AssignmentController::class, 'reject'])->name('reject');
        Route::post('{assignment}/submit', [AssignmentController::class, 'submit'])->name('submit');
        Route::post('{assignment}/return', [AssignmentController::class, 'returnToWriter'])->name('return');
        Route::post('{assignment}/deliver', [AssignmentController::class, 'deliver'])->name('deliver');
        Route::post('{assignment}/request-revision', [AssignmentController::class, 'requestRevision'])->name('request-revision');
        Route::post('{assignment}/complete', [AssignmentController::class, 'complete'])->name('complete');
        Route::post('{assignment}/cancel', [AssignmentController::class, 'cancel'])->name('cancel');
    });
});
