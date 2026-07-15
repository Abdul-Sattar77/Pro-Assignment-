<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('availability')->default('available')->after('is_active');
            $table->text('expertise')->nullable()->after('availability');
            $table->text('notes')->nullable()->after('expertise'); // Client notes
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['availability', 'expertise', 'notes']);
        });
    }
};
