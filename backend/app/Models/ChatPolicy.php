<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * One row of the admin permission matrix: may role_a and role_b message each
 * other? Role pair is stored canonically (role_a <= role_b, alphabetical).
 *
 * @property string $role_a
 * @property string $role_b
 * @property bool $allowed
 * @property bool $locked
 */
#[Fillable(['role_a', 'role_b', 'allowed', 'locked'])]
class ChatPolicy extends Model
{
    protected function casts(): array
    {
        return [
            'allowed' => 'boolean',
            'locked' => 'boolean',
        ];
    }

    /** Canonical (sorted) key for a role pair. */
    public static function pairKey(string $roleA, string $roleB): string
    {
        $pair = [$roleA, $roleB];
        sort($pair);

        return "{$pair[0]}|{$pair[1]}";
    }
}
