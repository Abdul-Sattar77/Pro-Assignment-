<?php

declare(strict_types=1);

use App\Enums\FileCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Files attached to assignments (briefs, submissions, general attachments).
 * Storage is provider-independent (Laravel Storage disk); this table holds
 * only metadata + the disk path. Direct FK to assignments now; can become
 * polymorphic (messages, complaints) later without data loss.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users')->restrictOnDelete();
            $table->string('category')->default(FileCategory::General->value);
            $table->string('original_name');
            $table->string('disk', 40);
            $table->string('path');
            $table->string('mime', 160);
            $table->unsignedBigInteger('size'); // bytes
            $table->timestamps();
            $table->softDeletes();

            $table->index(['assignment_id', 'created_at']);
        });

        $categories = implode("', '", FileCategory::values());
        DB::statement("ALTER TABLE files ADD CONSTRAINT files_category_check CHECK (category IN ('{$categories}'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
