<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Assignment;
use App\Models\Task;
use App\Observers\AssignmentObserver;
use App\Observers\TaskObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password-reset emails link to the frontend reset page (not the API).
        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $frontend = rtrim((string) config('app.frontend_url'), '/');
            $email = method_exists($notifiable, 'getEmailForPasswordReset')
                ? $notifiable->getEmailForPasswordReset()
                : '';

            return "{$frontend}/reset-password?token={$token}&email=".urlencode($email);
        });

        // Sync assignment writes into the calendar + task automation (adeel).
        Assignment::observe(AssignmentObserver::class);
        Task::observe(TaskObserver::class);
    }
}
