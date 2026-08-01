<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent to a client when a PM triggers a manual payment reminder for an invoice.
 * Queued so it never blocks the HTTP response.
 */
final class PaymentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Invoice $invoice,
        private readonly string $senderName,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $invoiceNumber = $this->invoice->number;
        $amount        = number_format((float) ($this->invoice->amount_cents / 100), 2);
        $currency      = $this->invoice->currency ?? 'PKR';
        $frontendUrl   = config('app.url');

        return (new MailMessage)
            ->subject("Payment Reminder: Invoice #{$invoiceNumber}")
            ->greeting('Dear ' . ($notifiable->name ?? 'Client') . ',')
            ->line("This is a friendly reminder that invoice **#{$invoiceNumber}** is still awaiting payment.")
            ->line("**Amount Due:** {$currency} {$amount}")
            ->action('View Invoice', "{$frontendUrl}/invoices/{$this->invoice->uuid}")
            ->line('Please complete your payment at your earliest convenience.')
            ->line("If you have already made the payment, kindly ignore this reminder.")
            ->salutation("Regards,\n{$this->senderName}");
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'payment_reminder',
            'title'         => 'Payment Reminder',
            'message'       => "Payment reminder sent for invoice #{$this->invoice->number}",
            'invoiceId'     => $this->invoice->uuid,
            'invoiceNumber' => $this->invoice->number,
            'amountCents'   => $this->invoice->amount_cents,
            'currency'      => $this->invoice->currency ?? 'PKR',
        ];
    }
}
