<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Small database-portability helpers. Production runs PostgreSQL while the test
 * suite runs SQLite in-memory, so any raw date SQL must adapt to the driver —
 * strftime() is SQLite-only, to_char() is Postgres, DATE_FORMAT() is MySQL.
 */
final class Sql
{
    /**
     * A driver-appropriate expression that formats a timestamp column as
     * 'YYYY-MM' (year-month), for grouping monthly trends.
     */
    public static function yearMonth(string $column = 'created_at'): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', {$column})",
            'mysql' => "DATE_FORMAT({$column}, '%Y-%m')",
            default => "TO_CHAR({$column}, 'YYYY-MM')",
        };
    }
}
