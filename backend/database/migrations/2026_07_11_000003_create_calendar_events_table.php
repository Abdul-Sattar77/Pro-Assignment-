<?php

declare(strict_types=1);

use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('event_type');
            $table->timestampTz('start_date');
            $table->timestampTz('end_date')->nullable();
            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->restrictOnDelete();
            $table->string('status')->default(CalendarEventStatus::Upcoming->value);
            $table->timestamps();
            $table->softDeletes();

            $table->index('event_type');
            $table->index('start_date');
            $table->index('user_id');
            $table->index('assignment_id');
            $table->index('task_id');
            $table->index('status');
        });

        // PostgreSQL check constraints for calendar event types and statuses.
        $types = implode("', '", CalendarEventType::values());
        DB::statement("ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_type_check CHECK (event_type IN ('{$types}'))");

        $statuses = implode("', '", CalendarEventStatus::values());
        DB::statement("ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_status_check CHECK (status IN ('{$statuses}'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
