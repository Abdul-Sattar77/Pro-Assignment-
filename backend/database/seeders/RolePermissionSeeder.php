<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\PermissionRegistrar;

/**
 * Seeds the data-driven RBAC model: the full permission catalog and the
 * per-role permission matrix. Idempotent (findOrCreate + syncPermissions) so
 * it is safe to re-run. Permissions use the `resource.action` convention.
 *
 * See docs/architecture/02-system-architecture.md §7.
 */
final class RolePermissionSeeder extends Seeder
{
    /** @var array<int, string> */
    private const PERMISSIONS = [
        // Users & roles
        'users.view', 'users.create', 'users.update', 'users.delete',
        'roles.view', 'roles.manage',
        // Leads
        'leads.view', 'leads.manage',
        // Assignments (workflow)
        'assignments.view', 'assignments.create', 'assignments.update', 'assignments.delete',
        'assignments.assign', 'assignments.submit', 'assignments.review', 'assignments.request_revision',
        // Files
        'files.view', 'files.upload', 'files.delete',
        // Messaging
        'messages.view', 'messages.send',
        // Finance
        'finance.view', 'invoices.manage', 'payments.verify',
        // Reporting
        'reports.view', 'analytics.view',
        // Tasks
        'tasks.view', 'tasks.manage',
        // Calendar
        'calendar.view', 'calendar.manage',
        // Settings
        'settings.manage',
        // Complaints, Templates, and Audit Logs
        'complaints.view', 'complaints.manage',
        'document_templates.view', 'document_templates.manage',
        'audit_logs.view',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $name) {
            Permission::findOrCreate($name, 'web');
        }

        foreach ($this->matrix() as $roleName => $permissions) {
            $role = SpatieRole::findOrCreate($roleName, 'web');
            $role->syncPermissions($permissions);
        }
    }

    /**
     * The per-role permission matrix.
     *
     * @return array<string, array<int, string>>
     */
    private function matrix(): array
    {
        return [
            // Admin has the full catalog.
            Role::Admin->value => self::PERMISSIONS,

            Role::ProjectManager->value => [
                'users.view',
                'leads.view', 'leads.manage',
                'assignments.view', 'assignments.create', 'assignments.update',
                'assignments.assign', 'assignments.review', 'assignments.request_revision',
                'files.view', 'files.upload', 'files.delete',
                'messages.view', 'messages.send',
                'finance.view', 'invoices.manage', 'payments.verify',
                'reports.view', 'analytics.view',
                'tasks.view', 'tasks.manage',
                'calendar.view', 'calendar.manage',
                'complaints.view', 'complaints.manage',
                'document_templates.view', 'document_templates.manage',
            ],

            Role::Writer->value => [
                'assignments.view', 'assignments.submit',
                'files.view', 'files.upload',
                'messages.view', 'messages.send',
                'finance.view',
                'tasks.view', 'tasks.manage',
                'calendar.view',
                'document_templates.view',
            ],

            Role::Client->value => [
                'assignments.view', 'assignments.create', 'assignments.request_revision',
                'files.view', 'files.upload',
                'messages.view', 'messages.send',
                'finance.view',
                'calendar.view',
                'complaints.view',
                'document_templates.view',
            ],
        ];
    }
}
