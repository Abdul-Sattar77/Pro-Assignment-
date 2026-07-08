<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Invoice lifecycle. pending → (client submits proof) awaiting_verification →
 * (staff verifies) paid. Either side may cancel while unpaid.
 */
enum InvoiceStatus: string
{
    case Pending = 'pending';
    case AwaitingVerification = 'awaiting_verification';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Awaiting payment',
            self::AwaitingVerification => 'Verifying payment',
            self::Paid => 'Paid',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $s): string => $s->value, self::cases());
    }
}
