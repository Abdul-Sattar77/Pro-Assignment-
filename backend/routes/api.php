<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Assignments\AssignmentController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Calendar\CalendarEventController;
use App\Http\Controllers\Api\V1\Files\FileController;
use App\Http\Controllers\Api\V1\Leads\LeadController;
use App\Http\Controllers\Api\V1\Messages\MessageController;
use App\Http\Controllers\Api\V1\Tasks\TaskController;
use App\Http\Controllers\Api\V1\Users\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| Versioned under /api/v1 (docs/api/api-standards.md §1). Each module adds
| its own route group here. Keep controllers thin; logic lives in services.
*/

Route::get('v1/dev-run-migrations', function () {
    return response()->json([
        'settings_exists' => \Illuminate\Support\Facades\Schema::hasTable('settings'),
        'users_exists' => \Illuminate\Support\Facades\Schema::hasTable('users'),
    ]);
});

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

    // ---- Lead Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('leads', LeadController::class)
            ->parameters(['leads' => 'lead'])
            ->names('leads');
    });

    // ---- Task Management ----
    Route::middleware('auth:sanctum')->prefix('tasks')->name('tasks.')->group(function (): void {
        Route::get('/', [TaskController::class, 'index'])->name('index');
        Route::post('/', [TaskController::class, 'store'])->name('store');
        Route::get('{task}', [TaskController::class, 'show'])->name('show');
        Route::patch('{task}', [TaskController::class, 'update'])->name('update');
        Route::delete('{task}', [TaskController::class, 'destroy'])->name('destroy');

        Route::post('{task}/assign', [TaskController::class, 'assign'])->name('assign');
        Route::post('{task}/complete', [TaskController::class, 'complete'])->name('complete');
        Route::post('{task}/cancel', [TaskController::class, 'cancel'])->name('cancel');
    });

    // ---- Calendar Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('calendar', CalendarEventController::class)
            ->parameters(['calendar' => 'calendar'])
            ->names('calendar');
    });

    // ---- Files Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('files/{file}/download', [FileController::class, 'download'])->name('files.download');
        Route::apiResource('files', FileController::class)
            ->parameters(['files' => 'file'])
            ->names('files');
    });

    // ---- Internal Messaging System ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('messages', [MessageController::class, 'conversations'])->name('messages.conversations');
        Route::get('messages/unread-count', [MessageController::class, 'unreadCount'])->name('messages.unread-count');
        Route::get('messages/assignment/{assignment}', [MessageController::class, 'assignmentConversations'])->name('messages.assignment-conversations');
        Route::get('messages/{conversation}', [MessageController::class, 'messages'])->name('messages.history');
        Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
        Route::put('messages/{message}', [MessageController::class, 'update'])->name('messages.update');
        Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
    });

    // ---- Assignments (workflow) ----
    Route::middleware('auth:sanctum')->prefix('assignments')->name('assignments.')->group(function (): void {
        Route::get('/', [AssignmentController::class, 'index'])->name('index');
        Route::post('/', [AssignmentController::class, 'store'])->name('store');
        Route::get('{assignment}', [AssignmentController::class, 'show'])->name('show');
        Route::patch('{assignment}', [AssignmentController::class, 'update'])->name('update');

        // Workflow actions (verbs as sub-paths per api-standards §11)
        Route::post('{assignment}/assign', [AssignmentController::class, 'assign'])->name('assign');
        Route::post('{assignment}/assign-manager', [AssignmentController::class, 'assignManager'])->name('assign-manager');
        Route::post('{assignment}/accept', [AssignmentController::class, 'accept'])->name('accept');
        Route::post('{assignment}/reject', [AssignmentController::class, 'reject'])->name('reject');
        Route::post('{assignment}/submit', [AssignmentController::class, 'submit'])->name('submit');
        Route::post('{assignment}/return', [AssignmentController::class, 'returnToWriter'])->name('return');
        Route::post('{assignment}/deliver', [AssignmentController::class, 'deliver'])->name('deliver');
        Route::post('{assignment}/request-revision', [AssignmentController::class, 'requestRevision'])->name('request-revision');
        Route::post('{assignment}/complete', [AssignmentController::class, 'complete'])->name('complete');
        Route::post('{assignment}/cancel', [AssignmentController::class, 'cancel'])->name('cancel');

        // Attachments (files & voice notes)
        Route::get('{assignment}/attachments', [AssignmentController::class, 'listAttachments'])->name('attachments.index');
        Route::post('{assignment}/attachments', [AssignmentController::class, 'uploadAttachment'])->name('attachments.store');
        Route::get('{assignment}/attachments/{attachment}/download', [AssignmentController::class, 'downloadAttachment'])->name('attachments.download');
        Route::delete('{assignment}/attachments/{attachment}', [AssignmentController::class, 'deleteAttachment'])->name('attachments.destroy');
    });

    // ---- Finance Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('finance/stats', [\App\Http\Controllers\Api\V1\Finance\FinanceController::class, 'stats'])->name('finance.stats');
        Route::post('payments/{payment}/verify', [\App\Http\Controllers\Api\V1\Finance\PaymentController::class, 'verify'])->name('payments.verify');

        Route::apiResource('invoices', \App\Http\Controllers\Api\V1\Finance\InvoiceController::class)
            ->parameters(['invoices' => 'invoice'])
            ->names('invoices');

        Route::apiResource('payments', \App\Http\Controllers\Api\V1\Finance\PaymentController::class)
            ->parameters(['payments' => 'payment'])
            ->names('payments');
    });

    // ---- Reports & Export System ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('reports', [\App\Http\Controllers\Api\V1\Reports\ReportsController::class, 'index'])->name('reports.index');
        Route::get('reports/export', [\App\Http\Controllers\Api\V1\Reports\ReportsController::class, 'export'])->name('reports.export');
    });

    // ---- Analytics & Dashboards ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('analytics', [\App\Http\Controllers\Api\V1\Analytics\AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\V1\Dashboard\DashboardController::class, 'index'])->name('dashboard.stats.index');
    });

    // ---- Users Extra Features (Ratings) ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('users/{user}/ratings', [\App\Http\Controllers\Api\V1\Users\WriterRatingController::class, 'index'])->name('users.ratings.index');
        Route::post('users/{user}/ratings', [\App\Http\Controllers\Api\V1\Users\WriterRatingController::class, 'store'])->name('users.ratings.store');
    });

    // ---- Complaint Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('complaints', \App\Http\Controllers\Api\V1\Complaints\ComplaintController::class)
            ->parameters(['complaints' => 'complaint'])
            ->names('complaints');
    });

    // ---- Document Templates ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('document-templates', \App\Http\Controllers\Api\V1\Documents\DocumentTemplateController::class)
            ->parameters(['document-templates' => 'documentTemplate'])
            ->names('document-templates');
    });

    // ---- System Audit Logs ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('audit-logs', [\App\Http\Controllers\Api\V1\Audit\AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // ---- Roles & Permissions ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('permissions', [\App\Http\Controllers\Api\V1\Roles\RoleController::class, 'permissions'])->name('permissions.index');
        Route::apiResource('roles', \App\Http\Controllers\Api\V1\Roles\RoleController::class)
            ->parameters(['roles' => 'role'])
            ->names('roles');
    });

    // ---- General System Settings ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('settings', [\App\Http\Controllers\Api\V1\Settings\SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [\App\Http\Controllers\Api\V1\Settings\SettingController::class, 'update'])->name('settings.update');
    });
});
