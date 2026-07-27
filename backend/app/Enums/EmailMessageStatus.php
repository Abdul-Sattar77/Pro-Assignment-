<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Lifecycle of an email record. Inbound mail is `Received` on arrival;
 * outbound starts `Queued` and becomes `Sent` once Gmail accepts it.
 */
enum EmailMessageStatus: string
{
    case Received = 'received';
    case Queued = 'queued';
    case Sent = 'sent';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Received => 'Received',
            self::Queued => 'Sending',
            self::Sent => 'Sent',
            self::Failed => 'Failed',
        };
    }
}
