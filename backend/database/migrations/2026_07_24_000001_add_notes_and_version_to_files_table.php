<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            if (!Schema::hasColumn('files', 'notes')) {
                $table->text('notes')->nullable();
            }
            if (!Schema::hasColumn('files', 'version')) {
                $table->unsignedInteger('version')->default(1);
            }
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            if (Schema::hasColumn('files', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('files', 'version')) {
                $table->dropColumn('version');
            }
        });
    }
};
