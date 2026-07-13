<?php

declare(strict_types=1);

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('assignment_id')->nullable()->constrained('assignments')->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // payer (client) or payee (writer)
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('bank_transfer'); // bank_transfer, stripe, paypal, cash, etc.
            $table->string('payment_type'); // advance, partial, balance, writer_payout, expense
            $table->foreignId('proof_file_id')->nullable()->constrained('files')->onDelete('set null'); // proof of payment file
            $table->string('status')->default(PaymentStatus::Pending->value);
            $table->timestampTz('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('payment_type');
            $table->index('assignment_id');
            $table->index('invoice_id');
            $table->index('user_id');
        });

        // PostgreSQL check constraints for type and status values
        $types = implode("', '", PaymentType::values());
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_type_check CHECK (payment_type IN ('{$types}'))");

        $statuses = implode("', '", PaymentStatus::values());
        DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('{$statuses}'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_type_check');
        DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check');
        Schema::dropIfExists('payments');
    }
};
