<?php

declare(strict_types=1);

namespace App\Enums;

/** How urgent the turnaround is. */
enum AssignmentPriority: string
{
    case Standard = 'standard';
    case Normal = 'normal';
    case Urgent = 'urgent';
    case Critical = 'critical';

    public function label(): string
    {
        return match ($this) {
            self::Standard => 'Standard',
            self::Normal => 'Normal',
            self::Urgent => 'Urgent',
            self::Critical => 'Critical',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }
}
