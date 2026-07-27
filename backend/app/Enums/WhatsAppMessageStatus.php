<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Delivery lifecycle of a WhatsApp message. Outbound messages start `Pending`
 * and are advanced by Meta's status webhooks; inbound messages are stored as
 * `Delivered` since their arrival is the delivery event.
 */
enum WhatsAppMessageStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Delivered = 'delivered';
    case Read = 'read';
    case Failed = 'failed';

    /** Human-readable label for UI display. */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Sending',
            self::Sent => 'Sent',
            self::Delivered => 'Delivered',
            self::Read => 'Read',
            self::Failed => 'Failed',
        };
    }

    /**
     * Rank used to stop out-of-order status webhooks from regressing a
     * message (Meta does not guarantee ordering — a `sent` callback can
     * arrive after `read`). Failed is terminal and never overwritten.
     */
    public function rank(): int
    {
        return match ($this) {
            self::Pending => 0,
            self::Sent => 1,
            self::Delivered => 2,
            self::Read => 3,
            self::Failed => 4,
        };
    }
}
