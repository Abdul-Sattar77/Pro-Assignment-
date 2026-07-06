<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Academic profile collected at client signup (university, department,
 * year of study). Nullable — staff accounts don't carry these.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('university', 160)->nullable()->after('email');
            $table->string('department', 120)->nullable()->after('university');
            $table->string('study_year', 40)->nullable()->after('department');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['university', 'department', 'study_year']);
        });
    }
};
