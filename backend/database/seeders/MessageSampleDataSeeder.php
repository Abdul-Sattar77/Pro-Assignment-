<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AssignmentPriority;
use App\Enums\AssignmentStatus;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Conversation;
use App\Models\File;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class MessageSampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Run Role/Permission Seeder to make sure Spatie roles exist
        $this->command->info('Running RolePermissionSeeder to ensure roles are configured...');
        $this->call(RolePermissionSeeder::class);

        // 2. Fetch or create users for each role
        $this->command->info('Configuring users for Admin, PM, Writer, and Client roles...');

        $admin = User::whereEmail('admin@prossignment.test')->first()
            ?: User::create([
                'name' => 'System Admin',
                'email' => 'admin@prossignment.test',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
        if (!$admin->hasRole(Role::Admin->value)) {
            $admin->syncRoles([Role::Admin->value]);
        }

        $pm = User::whereEmail('pm@prossignment.test')->first()
            ?: User::create([
                'name' => 'Jane PM',
                'email' => 'pm@prossignment.test',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
        if (!$pm->hasRole(Role::ProjectManager->value)) {
            $pm->syncRoles([Role::ProjectManager->value]);
        }

        $writer = User::whereEmail('writer@prossignment.test')->first()
            ?: User::create([
                'name' => 'John Writer',
                'email' => 'writer@prossignment.test',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
        if (!$writer->hasRole(Role::Writer->value)) {
            $writer->syncRoles([Role::Writer->value]);
        }

        $client = User::whereEmail('client@prossignment.test')->first()
            ?: User::create([
                'name' => 'Alice Client',
                'email' => 'client@prossignment.test',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
        if (!$client->hasRole(Role::Client->value)) {
            $client->syncRoles([Role::Client->value]);
        }

        // 3. Create at least 3 assignments if they don't exist
        $assignments = Assignment::all();
        if ($assignments->count() < 3) {
            $this->command->info('Creating 3 sample assignments linked to client, PM, and writer...');
            $assignments = collect([
                Assignment::create([
                    'title' => 'Biology Lab Report Analysis',
                    'subject' => 'Biology',
                    'description' => 'A comprehensive review of biological lab report and data compilation.',
                    'deadline' => Carbon::now()->addDays(5),
                    'status' => AssignmentStatus::InProgress,
                    'priority' => AssignmentPriority::High,
                    'word_count' => 2500,
                    'client_price' => 250.00,
                    'writer_cost' => 125.00,
                    'discount' => 0.00,
                    'net_profit' => 125.00,
                    'client_id' => $client->id,
                    'project_manager_id' => $pm->id,
                    'writer_id' => $writer->id,
                ]),
                Assignment::create([
                    'title' => 'World War II Historical Essay',
                    'subject' => 'History',
                    'description' => 'An analysis of political and military factors leading to World War II.',
                    'deadline' => Carbon::now()->addDays(7),
                    'status' => AssignmentStatus::Assigned,
                    'priority' => AssignmentPriority::Standard,
                    'word_count' => 1500,
                    'client_price' => 150.00,
                    'writer_cost' => 75.00,
                    'discount' => 10.00,
                    'net_profit' => 65.00,
                    'client_id' => $client->id,
                    'project_manager_id' => $pm->id,
                    'writer_id' => $writer->id,
                ]),
                Assignment::create([
                    'title' => 'Machine Learning Final Paper',
                    'subject' => 'Computer Science',
                    'description' => 'A research paper discussing the applications of neural networks in NLP.',
                    'deadline' => Carbon::now()->addDays(3),
                    'status' => AssignmentStatus::RevisionRequested,
                    'priority' => AssignmentPriority::Urgent,
                    'word_count' => 4000,
                    'client_price' => 450.00,
                    'writer_cost' => 220.00,
                    'discount' => 20.00,
                    'net_profit' => 210.00,
                    'client_id' => $client->id,
                    'project_manager_id' => $pm->id,
                    'writer_id' => $writer->id,
                ])
            ]);
        }

        // 4. Create files for attachments
        $this->command->info('Seeding sample file attachments...');
        $pdfFile = File::create([
            'filename' => 'sample_outline_pdf_' . time() . '.pdf',
            'original_name' => 'Project_Outline.pdf',
            'disk' => 'local',
            'path' => 'attachments/sample_outline_pdf_' . time() . '.pdf',
            'mime_type' => 'application/pdf',
            'size' => 102400,
            'uploaded_by' => $client->id,
            'assignment_id' => $assignments[0]->id,
        ]);

        $imgFile = File::create([
            'filename' => 'sample_chart_png_' . time() . '.png',
            'original_name' => 'Data_Chart.png',
            'disk' => 'local',
            'path' => 'attachments/sample_chart_png_' . time() . '.png',
            'mime_type' => 'image/png',
            'size' => 204800,
            'uploaded_by' => $writer->id,
            'assignment_id' => $assignments[0]->id,
        ]);

        $docxFile = File::create([
            'filename' => 'sample_draft_docx_' . time() . '.docx',
            'original_name' => 'First_Draft.docx',
            'disk' => 'local',
            'path' => 'attachments/sample_draft_docx_' . time() . '.docx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'size' => 312000,
            'uploaded_by' => $writer->id,
            'assignment_id' => $assignments[0]->id,
        ]);

        // 5. Create 3 conversations (linked to assignments)
        $this->command->info('Creating conversation channels...');

        // Conversation 1: Assignment 1, type = client (Client <-> PM/Admin)
        $conv1 = Conversation::create([
            'assignment_id' => $assignments[0]->id,
            'type' => 'client',
            'created_by' => $client->id,
        ]);

        // Conversation 2: Assignment 1, type = writer (Writer <-> PM/Admin)
        $conv2 = Conversation::create([
            'assignment_id' => $assignments[0]->id,
            'type' => 'writer',
            'created_by' => $pm->id,
        ]);

        // Conversation 3: Assignment 2, type = client (Client <-> PM/Admin)
        $conv3 = Conversation::create([
            'assignment_id' => $assignments[1]->id,
            'type' => 'client',
            'created_by' => $client->id,
        ]);

        // 6. Seed messages
        $this->command->info('Adding sample messages for back-and-forth history...');
        $messagesData = [];

        // Conversation 1 Messages
        $messagesData[] = ['conv' => $conv1, 'sender' => $client, 'type' => 'text', 'body' => "Hello! I've uploaded the prompt and draft structure for the biology lab report.", 'file' => null, 'time' => Carbon::now()->subDays(2)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $pm, 'type' => 'text', 'body' => "Hi Alice, got it! Let me review the requirements. We will make sure the writer adheres to all guidelines.", 'file' => null, 'time' => Carbon::now()->subDays(2)->addMinutes(30)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $pm, 'type' => 'text', 'body' => "I've assigned a biology writer who has a PhD in the subject. We will get back to you with an outline soon.", 'file' => null, 'time' => Carbon::now()->subDays(2)->addHours(1)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $client, 'type' => 'text', 'body' => "Sounds wonderful, thank you so much for the quick update!", 'file' => null, 'time' => Carbon::now()->subDays(1)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $pm, 'type' => 'text', 'body' => "You're welcome! Let us know if you need anything else.", 'file' => null, 'time' => Carbon::now()->subDays(1)->addHours(1)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $client, 'type' => 'file', 'body' => "Here is an updated bibliography guideline as well.", 'file' => $pdfFile, 'time' => Carbon::now()->subHours(12)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $admin, 'type' => 'text', 'body' => "System notification: PDF attachment received successfully.", 'file' => null, 'time' => Carbon::now()->subHours(12)->addMinutes(1)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $pm, 'type' => 'text', 'body' => "Thank you! I will pass this PDF outline to the writer immediately.", 'file' => null, 'time' => Carbon::now()->subHours(10)];
        $messagesData[] = ['conv' => $conv1, 'sender' => $client, 'type' => 'text', 'body' => "Great, please let me know when the first draft is ready.", 'file' => null, 'time' => Carbon::now()->subHours(1)]; // Unread for PM & Admin

        // Conversation 2 Messages
        $messagesData[] = ['conv' => $conv2, 'sender' => $pm, 'type' => 'text', 'body' => "Hey John, here's a new assignment on Biology Lab Report. Let me know if you can take this.", 'file' => null, 'time' => Carbon::now()->subDays(2)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $writer, 'type' => 'text', 'body' => "Hi Jane, yes! The requirements look straightforward. I can start working on it tonight.", 'file' => null, 'time' => Carbon::now()->subDays(2)->addHours(1)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $pm, 'type' => 'text', 'body' => "Excellent. The deadline is in 5 days, please upload an outline/draft within 48 hours.", 'file' => null, 'time' => Carbon::now()->subDays(2)->addHours(2)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $writer, 'type' => 'text', 'body' => "Will do! I'll outline the main methodology first.", 'file' => null, 'time' => Carbon::now()->subDays(1)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $writer, 'type' => 'image', 'body' => "Hi Jane, I've plotted the client's lab data. Does this graph match the expected format?", 'file' => $imgFile, 'time' => Carbon::now()->subHours(18)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $pm, 'type' => 'text', 'body' => "Yes, this chart looks perfect. Let's make sure we explain the standard deviation correctly.", 'file' => null, 'time' => Carbon::now()->subHours(16)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $writer, 'type' => 'text', 'body' => "Got it, continuing with the results section now.", 'file' => null, 'time' => Carbon::now()->subHours(14)];
        $messagesData[] = ['conv' => $conv2, 'sender' => $writer, 'type' => 'file', 'body' => "Here is the first draft of the methodology and results section.", 'file' => $docxFile, 'time' => Carbon::now()->subHours(2)]; // Unread for PM & Admin

        // Conversation 3 Messages
        $messagesData[] = ['conv' => $conv3, 'sender' => $client, 'type' => 'text', 'body' => "Hello, can we discuss the timeline for the History essay?", 'file' => null, 'time' => Carbon::now()->subDays(3)];
        $messagesData[] = ['conv' => $conv3, 'sender' => $pm, 'type' => 'text', 'body' => "Hi Alice, sure! The current deadline is in 7 days. Does that work for you?", 'file' => null, 'time' => Carbon::now()->subDays(3)->addHours(1)];
        $messagesData[] = ['conv' => $conv3, 'sender' => $client, 'type' => 'text', 'body' => "Yes, that is perfect. I need to submit it to my professor by next Monday.", 'file' => null, 'time' => Carbon::now()->subDays(2)];
        $messagesData[] = ['conv' => $conv3, 'sender' => $pm, 'type' => 'text', 'body' => "Noted. We will deliver the final paper at least 24 hours before your actual submission deadline.", 'file' => null, 'time' => Carbon::now()->subDays(2)->addHours(2)];
        $messagesData[] = ['conv' => $conv3, 'sender' => $client, 'type' => 'text', 'body' => "That would be amazing. Thanks!", 'file' => null, 'time' => Carbon::now()->subDays(1)]; // Read by all

        foreach ($messagesData as $msg) {
            Message::create([
                'conversation_id' => $msg['conv']->id,
                'sender_id' => $msg['sender']->id,
                'message' => $msg['body'],
                'attachment_id' => $msg['file'] ? $msg['file']->id : null,
                'message_type' => $msg['type'],
                'is_deleted' => false,
                'created_at' => $msg['time'],
            ]);
        }

        // 7. Establish participants and unread statuses
        $this->command->info('Setting up conversation participants & read receipts...');

        $setParticipantRead = function (int $convId, int $userId, Carbon $lastReadTime) {
            DB::table('conversation_participants')->updateOrInsert(
                ['conversation_id' => $convId, 'user_id' => $userId],
                ['last_read_at' => $lastReadTime, 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()]
            );
        };

        // Conversation 1 (Client channel - Client is up-to-date, PM & Admin are behind)
        $setParticipantRead($conv1->id, $client->id, Carbon::now());
        $setParticipantRead($conv1->id, $pm->id, Carbon::now()->subHours(5));
        $setParticipantRead($conv1->id, $admin->id, Carbon::now()->subHours(5));

        // Conversation 2 (Writer channel - Writer is up-to-date, PM & Admin are behind)
        $setParticipantRead($conv2->id, $writer->id, Carbon::now());
        $setParticipantRead($conv2->id, $pm->id, Carbon::now()->subHours(3));
        $setParticipantRead($conv2->id, $admin->id, Carbon::now()->subHours(3));

        // Conversation 3 (Client channel - Everyone is up-to-date)
        $setParticipantRead($conv3->id, $client->id, Carbon::now());
        $setParticipantRead($conv3->id, $pm->id, Carbon::now());
        $setParticipantRead($conv3->id, $admin->id, Carbon::now());

        $this->command->info('Database seeding of messages completed successfully!');
    }
}
