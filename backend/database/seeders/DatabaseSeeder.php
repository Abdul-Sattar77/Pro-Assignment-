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

        $projectManagers = [
            ['name' => 'John PM', 'email' => 'john.pm@prossignment.test'],
            ['name' => 'Sarah PM', 'email' => 'sarah.pm@prossignment.test'],
            ['name' => 'Ahmed PM', 'email' => 'ahmed.pm@prossignment.test'],
        ];

        foreach ($projectManagers as $pmData) {
            $pm = User::query()->firstOrCreate(
                ['email' => $pmData['email']],
                [
                    'name' => $pmData['name'],
                    'password' => 'password',
                    'is_active' => true,
                ],
            );
            $pm->syncRoles([Role::ProjectManager->value]);
        }

        // Seed proposal example tasks
        $exampleTasks = [
            [
                'title' => 'Call Client',
                'description' => 'Follow up with student client regarding urgent essay guidelines.',
                'priority' => \App\Enums\TaskPriority::High->value,
                'status' => \App\Enums\TaskStatus::Todo->value,
                'notes' => 'Call between 2 PM and 5 PM.',
            ],
            [
                'title' => 'Hire Writer',
                'description' => 'Recruit specialized academic writer for nursing assignment.',
                'priority' => \App\Enums\TaskPriority::Urgent->value,
                'status' => \App\Enums\TaskStatus::InProgress->value,
                'notes' => 'Verify writer portfolio first.',
            ],
            [
                'title' => 'Check Payment',
                'description' => 'Verify wire transfer receipt for Order #1049.',
                'priority' => \App\Enums\TaskPriority::Medium->value,
                'status' => \App\Enums\TaskStatus::Todo->value,
                'notes' => 'Check stripe dashboard.',
            ],
            [
                'title' => 'Marketing Tasks',
                'description' => 'Schedule social media promotional campaign for new semester.',
                'priority' => \App\Enums\TaskPriority::Low->value,
                'status' => \App\Enums\TaskStatus::InProgress->value,
                'notes' => 'Instagram & WhatsApp marketing posts.',
            ],
        ];

        foreach ($exampleTasks as $taskData) {
            \App\Models\Task::query()->firstOrCreate(
                ['title' => $taskData['title']],
                array_merge($taskData, [
                    'created_by_id' => $admin->id,
                ]),
            );
        }
    }
}
