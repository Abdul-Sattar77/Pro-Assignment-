<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Analytics\AnalyticsController;
use App\Http\Controllers\Api\V1\Assignments\AssignmentController;
use App\Http\Controllers\Api\V1\Audit\AuditLogController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Calendar\CalendarEventController;
use App\Http\Controllers\Api\V1\Complaints\ComplaintController;
use App\Http\Controllers\Api\V1\Dashboard\DashboardController;
use App\Http\Controllers\Api\V1\Documents\DocumentTemplateController;
use App\Http\Controllers\Api\V1\Files\FileController;
use App\Http\Controllers\Api\V1\Finance\InvoiceController;
use App\Http\Controllers\Api\V1\Leads\LeadController;
use App\Http\Controllers\Api\V1\Messages\MessageController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Controllers\Api\V1\Reports\ReportsController;
use App\Http\Controllers\Api\V1\Roles\RoleController;
use App\Http\Controllers\Api\V1\Settings\SettingController;
use App\Http\Controllers\Api\V1\Tasks\TaskController;
use App\Http\Controllers\Api\V1\Users\UserController;
use App\Http\Controllers\Api\V1\Users\WriterRatingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
| Versioned under /api/v1 (docs/api/api-standards.md §1). Each module adds
| its own route group here. Keep controllers thin; logic lives in services.
|
| Integration note: messaging, files and invoices use the per-order
| controllers from `main`; leads, tasks, calendar, reports, analytics,
| complaints, document-templates, audit-logs, roles, settings and the
| assignment attachments come from the admin panel branch.
*/

Route::prefix('v1')->group(function (): void {
    // ---- Identity & Authentication ----
    Route::prefix('auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('forgot-password', [PasswordResetController::class, 'forgot'])->name('auth.forgot-password');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('auth.reset-password');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('me', [AuthController::class, 'me'])->name('auth.me');
        });
    });

    // ---- Profile (own account) ----
    Route::middleware('auth:sanctum')->prefix('profile')->name('profile.')->group(function (): void {
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::post('password', [ProfileController::class, 'changePassword'])->name('password');
    });

    // ---- User Management (admin provisioning) ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('users', UserController::class)
            ->parameters(['users' => 'user'])
            ->names('users');

        // Writer ratings (admin panel)
        Route::get('users/{user}/ratings', [WriterRatingController::class, 'index'])->name('users.ratings.index');
        Route::post('users/{user}/ratings', [WriterRatingController::class, 'store'])->name('users.ratings.store');
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

    // ---- Assignments (workflow + attachments) ----
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

        // Files attached to an order (main: per-order FileController)
        Route::get('{assignment}/files', [FileController::class, 'index'])->name('files.index');
        Route::post('{assignment}/files', [FileController::class, 'store'])->name('files.store');

        // Per-order chat (main: per-order MessageController)
        Route::get('{assignment}/messages', [MessageController::class, 'index'])->name('messages.index');
        Route::post('{assignment}/messages', [MessageController::class, 'store'])->name('messages.store');

        // Attachments & voice notes (admin panel: AssignmentAttachment)
        Route::get('{assignment}/attachments', [AssignmentController::class, 'listAttachments'])->name('attachments.index');
        Route::post('{assignment}/attachments', [AssignmentController::class, 'uploadAttachment'])->name('attachments.store');
        Route::get('{assignment}/attachments/{attachment}/download', [AssignmentController::class, 'downloadAttachment'])->name('attachments.download');
        Route::delete('{assignment}/attachments/{attachment}', [AssignmentController::class, 'deleteAttachment'])->name('attachments.destroy');
    });

    // ---- Files (authorized binary access) ----
    Route::middleware('auth:sanctum')->prefix('files')->name('files.')->group(function (): void {
        Route::get('{file}/download', [FileController::class, 'download'])->name('download');
        Route::delete('{file}', [FileController::class, 'destroy'])->name('destroy');
    });

    // ---- Finance (invoices & payments — main) ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('finance/summary', [InvoiceController::class, 'summary'])->name('finance.summary');
        Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::post('invoices', [InvoiceController::class, 'store'])->name('invoices.store');
        Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::post('invoices/{invoice}/submit-payment', [InvoiceController::class, 'submitPayment'])->name('invoices.submit-payment');
        Route::post('invoices/{invoice}/verify', [InvoiceController::class, 'verify'])->name('invoices.verify');
        Route::post('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])->name('invoices.cancel');
    });

    // ---- Notifications (in-app) ----
    Route::middleware('auth:sanctum')->prefix('notifications')->name('notifications.')->group(function (): void {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
        Route::post('{id}/read', [NotificationController::class, 'markRead'])->name('read');
    });

    // ---- Reports & Export ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
        Route::get('reports/export', [ReportsController::class, 'export'])->name('reports.export');
    });

    // ---- Analytics & Dashboards ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('dashboard/stats', [DashboardController::class, 'index'])->name('dashboard.stats.index');
    });

    // ---- Complaint Management ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('complaints', ComplaintController::class)
            ->parameters(['complaints' => 'complaint'])
            ->names('complaints');
    });

    // ---- Document Templates ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('document-templates', DocumentTemplateController::class)
            ->parameters(['document-templates' => 'documentTemplate'])
            ->names('document-templates');
    });

    // ---- System Audit Logs ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });

    // ---- Roles & Permissions ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('permissions', [RoleController::class, 'permissions'])->name('permissions.index');
        Route::apiResource('roles', RoleController::class)
            ->parameters(['roles' => 'role'])
            ->names('roles');
    });

    // ---- General System Settings ----
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    });
});
