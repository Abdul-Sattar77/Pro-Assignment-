<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AssignmentPriority;
use App\Enums\TaskPriority;
use App\Enums\AssignmentStatus;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Comprehensive test seeder for PM panel hard-level testing.
 *
 * Creates:
 *  - 3 Writers  (writer1@test.com … writer3@test.com  / password)
 *  - 3 Clients  (client1@test.com … client3@test.com  / password)
 *  - 1 PM       (pm@prossignment.test / password)  — already exists
 *  - 8 Assignments in various statuses
 *  - 3 Invoices (pending, awaiting_verification, paid)
 *
 * Run: php artisan db:seed --class=PmTestingSeeder
 */
class PmTestingSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------------------------------------------
        // 1. Roles must already exist
        // ----------------------------------------------------------------
        $this->call(RolePermissionSeeder::class);

        // ----------------------------------------------------------------
        // 2. Fetch / ensure PM
        // ----------------------------------------------------------------
        /** @var User $pm */
        $pm = User::query()->where('email', 'pm@prossignment.test')->firstOrFail();

        // ----------------------------------------------------------------
        // 3. Writers
        // ----------------------------------------------------------------
        $writers = [];
        foreach ([
            ['name' => 'Ali Writer',   'email' => 'writer1@test.com'],
            ['name' => 'Sara Writer',  'email' => 'writer2@test.com'],
            ['name' => 'Bilal Writer', 'email' => 'writer3@test.com'],
        ] as $w) {
            $user = User::query()->firstOrCreate(
                ['email' => $w['email']],
                [
                    'name'      => $w['name'],
                    'password'  => 'password',
                    'is_active' => true,
                    'availability' => 'available',
                    'expertise' => 'Academic Writing, Research',
                ],
            );
            $user->syncRoles([Role::Writer->value]);
            $writers[] = $user;
        }

        // ----------------------------------------------------------------
        // 4. Clients
        // ----------------------------------------------------------------
        $clients = [];
        foreach ([
            ['name' => 'Zara Client',  'email' => 'client1@test.com'],
            ['name' => 'Omar Client',  'email' => 'client2@test.com'],
            ['name' => 'Hina Client',  'email' => 'client3@test.com'],
        ] as $c) {
            $user = User::query()->firstOrCreate(
                ['email' => $c['email']],
                [
                    'name'      => $c['name'],
                    'password'  => 'password',
                    'is_active' => true,
                ],
            );
            $user->syncRoles([Role::Client->value]);
            $clients[] = $user;
        }

        // ----------------------------------------------------------------
        // 5. Assignments — 8 different statuses
        // ----------------------------------------------------------------
        $assignments = [
            // [status, client_idx, writer_idx or null, pm, title]
            [
                'title'      => 'Research Paper on Climate Change',
                'status'     => AssignmentStatus::PendingAssignment->value,
                'client'     => $clients[0],
                'writer'     => null,
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Environmental Science',
                'deadline'   => now()->addDays(5)->toDateTimeString(),
                'pages'      => 10,
                'notes'      => 'Harvard referencing. Double-spaced.',
            ],
            [
                'title'      => 'Business Management Essay',
                'status'     => AssignmentStatus::Assigned->value,
                'client'     => $clients[1],
                'writer'     => $writers[0],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Business Studies',
                'deadline'   => now()->addDays(3)->toDateTimeString(),
                'pages'      => 5,
                'notes'      => 'APA style.',
            ],
            [
                'title'      => 'Nursing Care Plan',
                'status'     => AssignmentStatus::InProgress->value,
                'client'     => $clients[2],
                'writer'     => $writers[1],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Urgent->value,
                'subject'    => 'Nursing',
                'deadline'   => now()->addDays(1)->toDateTimeString(),
                'pages'      => 8,
                'notes'      => 'Must include SBAR format.',
            ],
            [
                'title'      => 'Computer Science Thesis Chapter',
                'status'     => AssignmentStatus::Submitted->value,
                'client'     => $clients[0],
                'writer'     => $writers[2],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Computer Science',
                'deadline'   => now()->addDays(2)->toDateTimeString(),
                'pages'      => 20,
                'notes'      => 'Chapter 3 only. IEEE citation.',
            ],
            [
                'title'      => 'Marketing Strategy Report',
                'status'     => AssignmentStatus::RevisionRequested->value,
                'client'     => $clients[1],
                'writer'     => $writers[0],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Marketing',
                'deadline'   => now()->addDays(4)->toDateTimeString(),
                'pages'      => 6,
                'notes'      => 'Client wants more data charts added.',
            ],
            [
                'title'      => 'Law Essay — Contract Law',
                'status'     => AssignmentStatus::Delivered->value,
                'client'     => $clients[2],
                'writer'     => $writers[1],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Law',
                'deadline'   => now()->subDays(1)->toDateTimeString(),
                'pages'      => 4,
                'notes'      => 'UK law only.',
            ],
            [
                'title'      => 'Psychology Literature Review',
                'status'     => AssignmentStatus::Completed->value,
                'client'     => $clients[0],
                'writer'     => $writers[2],
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'Psychology',
                'deadline'   => now()->subDays(3)->toDateTimeString(),
                'pages'      => 12,
                'notes'      => 'Already completed and delivered.',
            ],
            [
                'title'      => 'History Essay — World War II',
                'status'     => AssignmentStatus::Cancelled->value,
                'client'     => $clients[1],
                'writer'     => null,
                'pm'         => $pm,
                'priority'   => AssignmentPriority::Standard->value,
                'subject'    => 'History',
                'deadline'   => now()->subDays(5)->toDateTimeString(),
                'pages'      => 7,
                'notes'      => 'Cancelled by client.',
            ],
        ];

        $createdAssignments = [];
        foreach ($assignments as $aData) {
            $existing = Assignment::query()
                ->where('title', $aData['title'])
                ->first();

            if ($existing) {
                $createdAssignments[] = $existing;
                continue;
            }

            /** @var Assignment $assignment */
            $assignment = Assignment::query()->create([
                'title'              => $aData['title'],
                'description'        => $aData['notes'],
                'status'             => $aData['status'],
                'client_id'          => $aData['client']->getKey(),
                'writer_id'          => $aData['writer']?->getKey(),
                'project_manager_id' => $aData['pm']->getKey(),
                'priority'           => $aData['priority'],
                'subject'            => $aData['subject'],
                'deadline'           => $aData['deadline'],
                'word_count'         => $aData['pages'] * 275,
                'notes'              => $aData['notes'],
                'client_price'       => rand(50, 300),
                'writer_cost'        => rand(30, 150),
            ]);
            $createdAssignments[] = $assignment;
        }

        // ----------------------------------------------------------------
        // 6. Invoices
        // ----------------------------------------------------------------
        $invoiceData = [
            [
                'assignment'    => $createdAssignments[1], // Business Mgmt
                'client'        => $clients[1],
                'amount_cents'  => 15000,  // $150
                'status'        => InvoiceStatus::Pending->value,
                'currency'      => 'USD',
                'description'   => 'Business Management Essay — Initial Invoice',
            ],
            [
                'assignment'    => $createdAssignments[2], // Nursing
                'client'        => $clients[2],
                'amount_cents'  => 20000, // $200
                'status'        => InvoiceStatus::AwaitingVerification->value,
                'currency'      => 'USD',
                'description'   => 'Nursing Care Plan — Payment submitted, awaiting verification',
                'payment_reference' => 'TXN-STRIPE-' . strtoupper(Str::random(8)),
            ],
            [
                'assignment'    => $createdAssignments[6], // Psychology
                'client'        => $clients[0],
                'amount_cents'  => 12000, // $120
                'status'        => InvoiceStatus::Paid->value,
                'currency'      => 'USD',
                'description'   => 'Psychology Literature Review — Paid',
            ],
        ];

        foreach ($invoiceData as $iData) {
            $existing = Invoice::query()
                ->where('description', $iData['description'])
                ->first();

            if ($existing) {
                continue;
            }

            Invoice::query()->create([
                'number'            => 'INV-' . strtoupper(Str::random(8)),
                'assignment_id'     => $iData['assignment']->getKey(),
                'client_id'         => $iData['client']->getKey(),
                'issued_by'         => $pm->getKey(),
                'amount_cents'      => $iData['amount_cents'],
                'status'            => $iData['status'],
                'currency'          => $iData['currency'],
                'description'       => $iData['description'],
                'payment_reference' => $iData['payment_reference'] ?? null,
            ]);
        }

        // ----------------------------------------------------------------
        // 7. Summary output
        // ----------------------------------------------------------------
        $this->command->info('');
        $this->command->info('✅ PM Testing Data seeded successfully!');
        $this->command->info('');
        $this->command->table(
            ['Role', 'Name', 'Email', 'Password'],
            [
                ['Admin',          'System Admin',  'admin@prossignment.test',   'password'],
                ['Project Manager','Project Manager','pm@prossignment.test',      'password'],
                ['Writer',         'Ali Writer',    'writer1@test.com',           'password'],
                ['Writer',         'Sara Writer',   'writer2@test.com',           'password'],
                ['Writer',         'Bilal Writer',  'writer3@test.com',           'password'],
                ['Client',         'Zara Client',   'client1@test.com',           'password'],
                ['Client',         'Omar Client',   'client2@test.com',           'password'],
                ['Client',         'Hina Client',   'client3@test.com',           'password'],
            ]
        );
        $this->command->info('');
        $this->command->info('📋 Assignments: 8 created (all statuses covered)');
        $this->command->info('💰 Invoices:    3 created (pending, awaiting_verification, paid)');
        $this->command->info('');
    }
}
