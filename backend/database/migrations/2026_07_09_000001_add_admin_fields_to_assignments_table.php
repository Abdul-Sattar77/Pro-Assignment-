<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Integration note: `priority` and `word_count` are already added by the
     * main branch's `add_structured_fields_to_assignments_table` migration, so
     * this admin-panel migration only contributes the unique `notes` column
     * (the cost-breakdown migration positions its columns after it).
     */
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->text('notes')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropColumn(['notes']);
        });
    }
};
