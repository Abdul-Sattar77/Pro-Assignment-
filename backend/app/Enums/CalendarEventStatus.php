<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Calendar event status.
 */
enum CalendarEventStatus: string
{
    case Upcoming = 'upcoming';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Upcoming => 'Upcoming',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
