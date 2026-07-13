<?php

declare(strict_types=1);

use App\Enums\InvoiceStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('invoice_number')->unique();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('restrict');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default(InvoiceStatus::Pending->value);
            $table->timestampTz('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('invoice_number');
            $table->index('client_id');
            $table->index('assignment_id');
        });

        // PostgreSQL check constraint for allowed invoice statuses
        $statuses = implode("', '", InvoiceStatus::values());
        DB::statement("ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('{$statuses}'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check');
        Schema::dropIfExists('invoices');
    }
};
