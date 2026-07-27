<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\InvoiceStatus;
use App\Models\Invoice;
use App\Models\PaymentReminder;
use Illuminate\Console\Command;

final class SendScheduledPaymentRemindersCommand extends Command
{
    protected $signature = 'finance:send-payment-reminders';

    protected $description = 'Dispatch automatic payment reminders for pending invoices past due or approaching deadline.';

    public function handle(): int
    {
        $pendingInvoices = Invoice::query()
            ->where('status', InvoiceStatus::Pending->value)
            ->where('due_date', '<=', now()->addDays(2))
            ->get();

        $count = 0;
        foreach ($pendingInvoices as $invoice) {
            PaymentReminder::create([
                'invoice_id' => $invoice->id,
                'client_id' => $invoice->client_id,
                'type' => 'scheduled',
                'status' => 'sent',
                'notes' => 'Automatic payment reminder job executed for pending invoice #' . $invoice->invoice_number,
                'sent_at' => now(),
            ]);
            $count++;
        }

        $this->info("Successfully dispatched {$count} scheduled payment reminders.");

        return Command::SUCCESS;
    }
}
