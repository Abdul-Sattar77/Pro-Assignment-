<?php

declare(strict_types=1);

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->restrictOnDelete();
            $table->string('priority')->default(TaskPriority::Medium->value);
            $table->string('status')->default(TaskStatus::Todo->value);
            $table->timestampTz('due_date')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
            $table->index('assigned_user_id');
        });

        // PostgreSQL check constraints for data integrity at the database layer.
        $statuses = implode("', '", TaskStatus::values());
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('{$statuses}'))");

        $priorities = implode("', '", TaskPriority::values());
        DB::statement("ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('{$priorities}'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
