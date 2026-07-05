<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Root seeder. Seeds RBAC first, then a bootstrap admin so the system is
 * accessible on a fresh install. Model events are intentionally NOT disabled
 * here — the User's HasUuid trait relies on the `creating` event.
 *
 * Bootstrap admin (local/dev): admin@prossignment.test / password
 * Change or disable this before any non-local deployment.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@prossignment.test'],
            [
                'name' => 'System Admin',
                'password' => 'password',
                'is_active' => true,
            ],
        );

        $admin->syncRoles([Role::Admin->value]);
    }
}
