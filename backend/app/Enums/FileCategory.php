<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * What role a file plays on an assignment. Drives grouping in the UI and,
 * later, notification wording.
 */
enum FileCategory: string
{
    case Brief = 'brief';          // client's requirements / source material
    case Submission = 'submission'; // writer's delivered work
    case General = 'general';       // anything else shared on the order

    public function label(): string
    {
        return match ($this) {
            self::Brief => 'Brief',
            self::Submission => 'Submission',
            self::General => 'Attachment',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }
}
