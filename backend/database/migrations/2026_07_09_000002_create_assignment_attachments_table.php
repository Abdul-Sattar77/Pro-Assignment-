<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_attachments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();

            /** 'file' or 'voice_note' */
            $table->string('type', 20)->default('file');
            $table->string('disk', 40)->default('local');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('size')->nullable(); // bytes

            $table->timestamps();
            $table->softDeletes();

            $table->index(['assignment_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_attachments');
    }
};
