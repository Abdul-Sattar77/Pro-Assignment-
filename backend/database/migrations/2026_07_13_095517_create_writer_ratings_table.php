<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writer_ratings', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('writer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->unsignedInteger('quality'); // 1 to 5
            $table->unsignedInteger('timeliness'); // 1 to 5
            $table->unsignedInteger('communication'); // 1 to 5
            $table->double('overall_rating', 3, 2); // Average of three categories
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index(['writer_id', 'overall_rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writer_ratings');
    }
};
