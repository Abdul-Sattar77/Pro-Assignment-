<?php

declare(strict_types=1);

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('source');
            $table->string('status')->default(LeadStatus::New->value);
            $table->text('notes')->nullable();
            $table->text('lost_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('source');
        });

        // PostgreSQL check constraints for data integrity at the database layer.
        $statuses = implode("', '", LeadStatus::values());
        DB::statement("ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('{$statuses}'))");

        $sources = implode("', '", LeadSource::values());
        DB::statement("ALTER TABLE leads ADD CONSTRAINT leads_source_check CHECK (source IN ('{$sources}'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
