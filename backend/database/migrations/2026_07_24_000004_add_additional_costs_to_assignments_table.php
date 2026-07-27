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
            if (!Schema::hasColumn('assignments', 'additional_costs')) {
                $table->decimal('additional_costs', 10, 2)->default(0.00)->after('writer_cost');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table): void {
            if (Schema::hasColumn('assignments', 'additional_costs')) {
                $table->dropColumn('additional_costs');
            }
        });
    }
};
