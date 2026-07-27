<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled tasks
|--------------------------------------------------------------------------
| Requires a cron entry running the scheduler:
|   * * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
*/

// Poll the shared Gmail mailbox. `withoutOverlapping` matters: a slow run must
// not stack a second sync on top and race the unique gmail_message_id index.
Schedule::command('email:sync')
    ->everyMinute()
    ->withoutOverlapping(5)
    ->runInBackground();
