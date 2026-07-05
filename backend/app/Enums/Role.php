<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The four system roles. Backed by string slugs used as Spatie role names.
 * This enum is the source of truth for role identifiers — never hardcode
 * role strings elsewhere (docs/architecture/02-system-architecture.md §3, §7).
 */
enum Role: string
{
    case Admin = 'admin';
    case ProjectManager = 'project_manager';
    case Writer = 'writer';
    case Client = 'client';

    /** Human-readable label for UI display. */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::ProjectManager => 'Project Manager',
            self::Writer => 'Writer',
            self::Client => 'Client',
        };
    }

    /**
     * All role slugs.
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $role): string => $role->value, self::cases());
    }
}
