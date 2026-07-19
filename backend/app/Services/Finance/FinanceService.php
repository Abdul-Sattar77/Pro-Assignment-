<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Exceptions\DomainRuleException;
use App\Models\Assignment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\InvoiceRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class FinanceService
{
    public function __construct(
        private readonly InvoiceRepositoryInterface $invoices,
        private readonly PaymentRepositoryInterface $payments,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    /**
     * Create an invoice for an assignment.
     */
    public function createInvoice(User $actor, array $data): Invoice
    {
        $assignment = $this->assignments->find($data['assignment_id']);
        if ($assignment === null) {
            throw new DomainRuleException('The selected assignment does not exist.', 'ASSIGNMENT_NOT_FOUND', 404);
        }

        // Verify if invoice already exists for this assignment
        $existing = Invoice::query()->where('assignment_id', $assignment->id)->first();
        if ($existing !== null) {
            throw new DomainRuleException('An invoice has already been generated for this assignment.', 'INVOICE_ALREADY_EXISTS', 422);
        }

        return DB::transaction(function () use ($assignment, $data): Invoice {
            $amount = $data['amount'] ?? ($assignment->client_price - $assignment->discount);
            $invoiceNumber = 'INV-'.Carbon::now()->format('Ymd').'-'.Str::upper(Str::random(6));

            return $this->invoices->create([
                'invoice_number' => $invoiceNumber,
                'assignment_id' => $assignment->id,
                'client_id' => $assignment->client_id,
                'amount' => $amount,
                'status' => InvoiceStatus::Pending->value,
                'due_date' => $data['due_date'] ?? Carbon::now()->addDays(7),
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * Update invoice details/status.
     */
    public function updateInvoice(User $actor, Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($invoice, $data): Invoice {
            $updated = $this->invoices->update($invoice, $data);

            // Re-sync invoice status if status changed to Paid manually,
            // or if it changed back to pending
            return $updated;
        });
    }

    /**
     * Delete an invoice.
     */
    public function deleteInvoice(User $actor, Invoice $invoice): void
    {
        DB::transaction(function () use ($invoice): void {
            $this->invoices->delete($invoice);
        });
    }

    /**
     * Record a payment (client payment or writer payout / expense).
     */
    public function recordPayment(User $actor, array $data): Payment
    {
        return DB::transaction(function () use ($actor, $data): Payment {
            $invoiceId = null;
            $assignmentId = $data['assignment_id'] ?? null;
            $clientId = $data['user_id'] ?? null;

            if (isset($data['invoice_id'])) {
                $invoice = $this->invoices->find($data['invoice_id']);
                if ($invoice !== null) {
                    $invoiceId = $invoice->id;
                    $assignmentId = $invoice->assignment_id;
                    $clientId = $clientId ?? $invoice->client_id;
                }
            }

            // Determine initial status: Client uploads proof as Pending; Admin records as Verified or Pending.
            $status = PaymentStatus::Pending;
            if ($actor->hasRole('admin') && ($data['verified'] ?? false)) {
                $status = PaymentStatus::Verified;
            }

            /** @var Payment $payment */
            $payment = $this->payments->create([
                'assignment_id' => $assignmentId,
                'invoice_id' => $invoiceId,
                'user_id' => $clientId,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'] ?? 'bank_transfer',
                'payment_type' => $data['payment_type'],
                'proof_file_id' => $data['proof_file_id'] ?? null,
                'status' => $status->value,
                'verified_at' => $status === PaymentStatus::Verified ? Carbon::now() : null,
                'verified_by' => $status === PaymentStatus::Verified ? $actor->getKey() : null,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($status === PaymentStatus::Verified && $invoiceId !== null) {
                $this->recalculateInvoiceStatus($invoiceId);
            }

            return $payment;
        });
    }

    /**
     * Verify or reject a payment proof (Admin only).
     */
    public function verifyPayment(User $actor, Payment $payment, string $status, ?string $notes = null): Payment
    {
        if (!in_array($status, PaymentStatus::values(), true)) {
            throw new DomainRuleException('Invalid payment status value.', 'INVALID_PAYMENT_STATUS', 422);
        }

        return DB::transaction(function () use ($actor, $payment, $status, $notes): Payment {
            $updateData = [
                'status' => $status,
                'notes' => $notes ?? $payment->notes,
            ];

            if ($status === PaymentStatus::Verified->value) {
                $updateData['verified_at'] = Carbon::now();
                $updateData['verified_by'] = $actor->getKey();
            } else {
                $updateData['verified_at'] = null;
                $updateData['verified_by'] = null;
            }

            /** @var Payment $updated */
            $updated = $this->payments->update($payment, $updateData);

            if ($updated->invoice_id !== null) {
                $this->recalculateInvoiceStatus($updated->invoice_id);
            }

            return $updated;
        });
    }

    /**
     * Delete a payment record.
     */
    public function deletePayment(User $actor, Payment $payment): void
    {
        DB::transaction(function () use ($payment): void {
            $invoiceId = $payment->invoice_id;
            $this->payments->delete($payment);

            if ($invoiceId !== null) {
                $this->recalculateInvoiceStatus($invoiceId);
            }
        });
    }

    /**
     * Recalculate Invoice Status based on total verified payments.
     */
    private function recalculateInvoiceStatus(int $invoiceId): void
    {
        $invoice = Invoice::query()->find($invoiceId);
        if ($invoice === null) {
            return;
        }

        // Sum verified inflow payments for this invoice
        $totalPaid = Payment::query()
            ->where('invoice_id', $invoiceId)
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->sum('amount');

        $newStatus = InvoiceStatus::Pending;
        if ($totalPaid >= $invoice->amount) {
            $newStatus = InvoiceStatus::Paid;
        }

        $invoice->update(['status' => $newStatus->value]);
    }

    /**
     * Fetch aggregated statistics for Admin Finance Dashboard.
     */
    public function getStats(User $actor): array
    {
        // 1. Inflow (revenue): sum of verified payments of type advance, partial, balance
        $revenue = Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->sum('amount');

        // 2. Outflow (expenses): sum of verified payments of type writer_payout, expense
        $expenses = Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::WriterPayout->value,
                PaymentType::Expense->value,
            ])
            ->sum('amount');

        $profit = $revenue - $expenses;
        $profitMargin = $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0;

        // 3. Monthly Breakdown (past 12 months)
        $monthlyBreakdownQuery = DB::table('payments')
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw("SUM(CASE WHEN status = 'verified' AND payment_type IN ('advance', 'partial', 'balance') THEN amount ELSE 0 END) as revenue"),
                DB::raw("SUM(CASE WHEN status = 'verified' AND payment_type IN ('writer_payout', 'expense') THEN amount ELSE 0 END) as expenses"),
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->whereNull('deleted_at')
            ->groupBy(DB::raw("TO_CHAR(created_at, 'YYYY-MM')"))
            ->orderBy('month', 'asc')
            ->get();

        $monthlyBreakdown = [];
        foreach ($monthlyBreakdownQuery as $row) {
            $rev = (float) $row->revenue;
            $exp = (float) $row->expenses;
            $prof = $rev - $exp;
            $monthlyBreakdown[] = [
                'month' => $row->month,
                'revenue' => $rev,
                'expenses' => $exp,
                'profit' => $prof,
            ];
        }

        // 4. Pending verification count
        $pendingVerificationCount = Payment::query()
            ->where('status', PaymentStatus::Pending->value)
            ->count();

        // 5. Recent payments
        $recentPayments = Payment::query()
            ->with(['assignment', 'invoice', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'totalRevenue' => (float) $revenue,
            'totalExpenses' => (float) $expenses,
            'totalProfit' => (float) $profit,
            'profitMargin' => $profitMargin,
            'monthlyBreakdown' => $monthlyBreakdown,
            'pendingVerificationCount' => $pendingVerificationCount,
            'recentPayments' => $recentPayments,
        ];
    }
}
