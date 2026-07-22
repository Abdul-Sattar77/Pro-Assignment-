<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table): void {
            if (!Schema::hasColumn('complaints', 'writer_id')) {
                $table->foreignId('writer_id')->nullable()->after('project_manager_id')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table): void {
            if (Schema::hasColumn('complaints', 'writer_id')) {
                $table->dropForeign(['writer_id']);
                $table->dropColumn('writer_id');
            }
        });
    }
};
