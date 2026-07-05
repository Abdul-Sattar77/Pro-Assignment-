<?php

declare(strict_types=1);

use App\Enums\AssignmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title');
            $table->string('subject');
            $table->text('description');
            $table->timestampTz('deadline');
            $table->string('status')->default(AssignmentStatus::PendingAssignment->value);

            // Workflow parties. Client is the owner; PM/writer attach later.
            $table->foreignId('client_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('writer_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('deadline');
            $table->index(['client_id', 'status']);
            $table->index(['writer_id', 'status']);
        });

        // PostgreSQL check constraint keeps the state machine honest at the DB level.
        $statuses = implode("', '", AssignmentStatus::values());
        DB::statement("ALTER TABLE assignments ADD CONSTRAINT assignments_status_check CHECK (status IN ('{$statuses}'))");

        Schema::create('assignment_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('type');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['assignment_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_events');
        Schema::dropIfExists('assignments');
    }
};
