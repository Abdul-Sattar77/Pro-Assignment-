<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Assignment priority levels — four-tier system used for admin triage
 * and filtering. Stored as a string column with a DB-level check constraint.
 */
enum AssignmentPriority: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    public function label(): string
    {
        return match ($this) {
            self::Low    => 'Low',
            self::Normal => 'Normal',
            self::High   => 'High',
            self::Urgent => 'Urgent',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $p): string => $p->value, self::cases());
    }
}
