<?php

declare(strict_types=1);

use App\Enums\InvoiceStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Invoices raised against an assignment. Money is stored as integer minor
 * units (cents) + currency — never floats (docs/conventions/backend §3).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('number')->unique();
            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->foreignId('client_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('issued_by')->constrained('users')->restrictOnDelete();
            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('PKR');
            $table->string('status')->default(InvoiceStatus::Pending->value);
            $table->string('description')->nullable();
            $table->string('payment_reference')->nullable(); // client's proof/txn ref
            $table->timestampTz('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_id', 'status']);
            $table->index('status');
        });

        $statuses = implode("', '", InvoiceStatus::values());
        DB::statement("ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('{$statuses}'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
