<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            $table->unsignedBigInteger('assignment_id')->nullable()->change();
        });

        // Ensure PostgreSQL drops NOT NULL constraint cleanly
        DB::statement('ALTER TABLE files ALTER COLUMN assignment_id DROP NOT NULL');
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            $table->unsignedBigInteger('assignment_id')->nullable(false)->change();
        });
    }
};
