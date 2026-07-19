<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Clean up any legacy 'normal' priority strings in the assignments table
        DB::table('assignments')
            ->where('priority', 'normal')
            ->update(['priority' => 'standard']);
    }

    public function down(): void
    {
        // Down migration can revert back if needed
        DB::table('assignments')
            ->where('priority', 'standard')
            ->update(['priority' => 'normal']);
    }
};
