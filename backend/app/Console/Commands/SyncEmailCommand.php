<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Exceptions\GmailException;
use App\Services\Email\EmailSyncService;
use App\Services\Email\GmailClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Polls Gmail for new mail. Scheduled every minute (routes/console.php) and
 * safe to run by hand for a one-off catch-up.
 */
final class SyncEmailCommand extends Command
{
    protected $signature = 'email:sync
        {--max= : Override how many messages to pull this run}';

    protected $description = 'Pull new mail from the shared Gmail mailbox into the portal inbox';

    public function handle(EmailSyncService $sync, GmailClient $gmail): int
    {
        if (!$gmail->isConfigured()) {
            $this->warn('Gmail is not configured — set GMAIL_MAILBOX and the credentials for your GMAIL_AUTH_MODE.');

            // Not a failure: an unconfigured mailbox on a fresh deploy should
            // not spam the scheduler's failure channel every minute.
            return self::SUCCESS;
        }

        $max = $this->option('max') !== null ? (int) $this->option('max') : null;

        try {
            $result = $sync->sync($max);
        } catch (GmailException $e) {
            $sync->recordFailure($e->getMessage());

            if ($e->isAuthFailure()) {
                $this->error('Gmail rejected our credentials — re-check domain-wide delegation or the refresh token.');
            } else {
                $this->error("Gmail sync failed: {$e->getMessage()}");
            }

            Log::error('Gmail sync failed.', [
                'reason' => $e->reason,
                'status' => $e->status,
                'message' => $e->getMessage(),
            ]);

            return self::FAILURE;
        }

        $this->info(sprintf(
            'Gmail sync: %d fetched, %d stored, %d already known.',
            $result['fetched'],
            $result['stored'],
            $result['skipped'],
        ));

        return self::SUCCESS;
    }
}
