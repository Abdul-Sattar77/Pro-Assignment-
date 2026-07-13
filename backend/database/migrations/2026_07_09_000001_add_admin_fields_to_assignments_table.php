<?php

declare(strict_types=1);

use App\Enums\AssignmentPriority;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->string('priority')->default(AssignmentPriority::Normal->value)->after('status');
            $table->unsignedInteger('word_count')->nullable()->after('priority');
            $table->text('notes')->nullable()->after('word_count');

            $table->index('priority');
        });

        // DB-level check constraint for priority values.
        $priorities = implode("', '", AssignmentPriority::values());
        DB::statement("ALTER TABLE assignments ADD CONSTRAINT assignments_priority_check CHECK (priority IN ('{$priorities}'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_priority_check');

        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropIndex(['priority']);
            $table->dropColumn(['priority', 'word_count', 'notes']);
        });
    }
};
