<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Gives a model a public-facing `uuid` (exposed in URLs/APIs) while keeping a
 * fast bigint primary key internally. Prevents sequential-ID enumeration and
 * is a multi-tenancy readiness decision (docs/architecture/03-future-proofing).
 *
 * Requires a `uuid` column on the model's table.
 */
trait HasUuid
{
    protected static function bootHasUuid(): void
    {
        static::creating(static function ($model): void {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /** Resolve route-model bindings by uuid, not the internal id. */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
