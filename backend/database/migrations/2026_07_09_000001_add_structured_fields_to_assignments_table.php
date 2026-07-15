<?php

declare(strict_types=1);

use App\Enums\AcademicLevel;
use App\Enums\AssignmentPriority;
use App\Enums\AssignmentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Break the free-text brief into discrete academic fields so admin/PM panels
 * can search, filter, and report on each attribute (client request).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            // Assignment details — each its own column for clean filtering.
            $table->string('type')->nullable()->after('subject');
            $table->string('academic_level')->nullable()->after('type');
            $table->string('course')->nullable()->after('academic_level');
            $table->string('university')->nullable()->after('course');
            $table->unsignedInteger('word_count')->nullable()->after('university');
            $table->string('referencing_style')->nullable()->after('word_count');
            $table->string('priority')->default(AssignmentPriority::Standard->value)->after('referencing_style');

            // Student contact details captured at submission.
            $table->string('contact_phone')->nullable()->after('priority');
            $table->string('contact_whatsapp')->nullable()->after('contact_phone');
        });

        // Keep the enum-like columns honest at the DB level (Postgres check constraints).
        $types = implode("', '", AssignmentType::values());
        $levels = implode("', '", AcademicLevel::values());
        $priorities = implode("', '", AssignmentPriority::values());

        DB::statement("ALTER TABLE assignments ADD CONSTRAINT assignments_type_check CHECK (type IS NULL OR type IN ('{$types}'))");
        DB::statement("ALTER TABLE assignments ADD CONSTRAINT assignments_academic_level_check CHECK (academic_level IS NULL OR academic_level IN ('{$levels}'))");
        DB::statement("ALTER TABLE assignments ADD CONSTRAINT assignments_priority_check CHECK (priority IN ('{$priorities}'))");

        Schema::table('assignments', function (Blueprint $table): void {
            $table->index('type');
            $table->index('academic_level');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_type_check');
        DB::statement('ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_academic_level_check');
        DB::statement('ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_priority_check');

        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropIndex(['type']);
            $table->dropIndex(['academic_level']);
            $table->dropIndex(['priority']);
            $table->dropColumn([
                'type',
                'academic_level',
                'course',
                'university',
                'word_count',
                'referencing_style',
                'priority',
                'contact_phone',
                'contact_whatsapp',
            ]);
        });
    }
};
