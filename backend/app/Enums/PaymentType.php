<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Payment type / category classifications.
 */
enum PaymentType: string
{
    case Advance = 'advance';
    case Partial = 'partial';
    case Balance = 'balance';
    case WriterPayout = 'writer_payout';
    case Expense = 'expense';

    public function label(): string
    {
        return match ($this) {
            self::Advance => 'Advance Payment',
            self::Partial => 'Partial Payment',
            self::Balance => 'Remaining Balance Payment',
            self::WriterPayout => 'Writer Payout',
            self::Expense => 'Operational Expense',
        };
    }

    /**
     * Checks if this payment type represents cash inflow (revenue).
     */
    public function isInflow(): bool
    {
        return in_array($this, [self::Advance, self::Partial, self::Balance], true);
    }

    /**
     * Checks if this payment type represents cash outflow (expense).
     */
    public function isOutflow(): bool
    {
        return in_array($this, [self::WriterPayout, self::Expense], true);
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $type): string => $type->value, self::cases());
    }
}
