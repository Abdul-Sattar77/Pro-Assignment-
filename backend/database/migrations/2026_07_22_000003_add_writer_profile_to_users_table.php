<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Structured writer expertise/availability, kept ALONGSIDE the existing freeform
 * `expertise` string (which the admin panel uses) so nothing there changes.
 * A single JSON blob holds the writer's self-service fields: subjects,
 * universities, coding languages, dissertation experience, urgent capability,
 * max word count, and max workload.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->json('writer_profile')->nullable()->after('expertise');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('writer_profile');
        });
    }
};
