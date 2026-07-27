<?php

declare(strict_types=1);

use App\Enums\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The chat policy matrix was seeded for the original four roles, so adding
 * `sales` leaves its pairs missing and internal chat silently denied. This
 * backfills every pair containing `sales` (canonical order: role_a <= role_b).
 *
 * Defaults mirror the original seeder's intent: admin pairs are allowed and
 * locked, PM pairs allowed. Sales additionally reaches clients (that is the
 * job) and other sales reps; sales<->writer starts OFF for the admin to enable.
 */
return new class extends Migration
{
    public function up(): void
    {
        $sales = Role::Sales->value;
        $now = now();
        $rows = [];

        foreach (Role::values() as $other) {
            $pair = [$sales, $other];
            sort($pair);
            [$a, $b] = $pair;

            $hasAdmin = in_array(Role::Admin->value, $pair, true);
            $hasPm = in_array(Role::ProjectManager->value, $pair, true);
            $hasClient = in_array(Role::Client->value, $pair, true);
            $salesOnly = $a === $sales && $b === $sales;

            $rows[] = [
                'role_a' => $a,
                'role_b' => $b,
                'allowed' => $hasAdmin || $hasPm || $hasClient || $salesOnly,
                'locked' => $hasAdmin,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Idempotent: re-running must not violate the (role_a, role_b) unique.
        DB::table('chat_policies')->upsert($rows, ['role_a', 'role_b'], ['updated_at']);
    }

    public function down(): void
    {
        $sales = Role::Sales->value;

        DB::table('chat_policies')
            ->where('role_a', $sales)
            ->orWhere('role_b', $sales)
            ->delete();
    }
};
