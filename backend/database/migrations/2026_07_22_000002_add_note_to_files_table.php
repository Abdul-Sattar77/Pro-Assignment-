<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-file notes: clients can attach a short instruction to each uploaded file
 * ("Add Notes Per File" in the client brief). Nullable + additive.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            $table->string('note', 2000)->nullable()->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table): void {
            $table->dropColumn('note');
        });
    }
};
