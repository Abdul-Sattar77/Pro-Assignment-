<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->decimal('client_price', 10, 2)->default(0)->after('notes');
            $table->decimal('writer_cost', 10, 2)->default(0)->after('client_price');
            $table->decimal('discount', 10, 2)->default(0)->after('writer_cost');
            $table->decimal('net_profit', 10, 2)->default(0)->after('discount');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            $table->dropColumn(['client_price', 'writer_cost', 'discount', 'net_profit']);
        });
    }
};
