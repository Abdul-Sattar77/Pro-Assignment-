<?php

declare(strict_types=1);

namespace App\Enums;

/** Student's level of study. */
enum AcademicLevel: string
{
    case HighSchool = 'high_school';
    case Undergraduate = 'undergraduate';
    case Masters = 'masters';
    case Phd = 'phd';

    public function label(): string
    {
        return match ($this) {
            self::HighSchool => 'High school',
            self::Undergraduate => 'Undergraduate',
            self::Masters => "Master's",
            self::Phd => 'PhD',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }
}
