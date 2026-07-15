<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Lead workflow statuses.
 */
enum LeadStatus: string
{
    case New = 'new';
    case Quoted = 'quoted';
    case Negotiating = 'negotiating';
    case Won = 'won';
    case Lost = 'lost';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Quoted => 'Quoted',
            self::Negotiating => 'Negotiating',
            self::Won => 'Won',
            self::Lost => 'Lost',
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
