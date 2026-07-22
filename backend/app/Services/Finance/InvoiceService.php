<?php

declare(strict_types=1);

namespace App\Services\Finance;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Exceptions\DomainRuleException;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Finance business logic — invoice lifecycle and money summaries. All amounts
 * are integer minor units (cents); never floats.
 */
final class InvoiceService
{
    /**
     * @param  array{assignmentId?: string|null, clientId: int, amountCents: int, currency: string, description?: string|null}  $data
     */
    public function create(User $issuer, array $data, ?int $assignmentId): Invoice
    {
        if ($data['amountCents'] <= 0) {
            throw new DomainRuleException('The amount must be greater than zero.', 'INVALID_AMOUNT', 422);
        }

        return Invoice::query()->create([
            'number' => $this->nextNumber(),
            'assignment_id' => $assignmentId,
            'client_id' => $data['clientId'],
            'issued_by' => $issuer->getKey(),
            'amount_cents' => $data['amountCents'],
            'currency' => strtoupper($data['currency']),
            'status' => InvoiceStatus::Pending,
            'description' => $data['description'] ?? null,
        ]);
    }

    /** Client submits proof of payment → awaiting verification. */
    public function submitPayment(User $client, Invoice $invoice, string $reference): Invoice
    {
        if ($invoice->client_id !== $client->getKey()) {
            throw new DomainRuleException('This invoice belongs to another client.', 'NOT_INVOICE_OWNER', 403);
        }

        if (!in_array($invoice->status, [InvoiceStatus::Pending, InvoiceStatus::AwaitingVerification], true)) {
            throw new DomainRuleException('This invoice can no longer be paid.', 'INVOICE_NOT_PAYABLE', 409);
        }

        $invoice->update([
            'status' => InvoiceStatus::AwaitingVerification,
            'payment_reference' => $reference,
        ]);

        return $invoice->refresh();
    }

    /** Staff verifies the payment → paid. */
    public function verify(Invoice $invoice): Invoice
    {
        if ($invoice->status !== InvoiceStatus::AwaitingVerification) {
            throw new DomainRuleException('There is no payment awaiting verification.', 'NOTHING_TO_VERIFY', 409);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($invoice) {
            $totalPaid = \App\Models\Payment::query()
                ->where('invoice_id', $invoice->id)
                ->where('status', \App\Enums\PaymentStatus::Verified->value)
                ->whereIn('payment_type', [
                    \App\Enums\PaymentType::Advance->value,
                    \App\Enums\PaymentType::Partial->value,
                    \App\Enums\PaymentType::Balance->value,
                ])
                ->sum('amount');
            $paidAmountCents = (int) round($totalPaid * 100);
            $dueAmountCents = max(0, $invoice->amount_cents - $paidAmountCents);

            if ($dueAmountCents > 0) {
                \App\Models\Payment::query()->create([
                    'invoice_id' => $invoice->id,
                    'assignment_id' => $invoice->assignment_id,
                    'user_id' => $invoice->client_id,
                    'amount' => $dueAmountCents / 100,
                    'payment_method' => 'bank_transfer',
                    'payment_type' => \App\Enums\PaymentType::Balance->value,
                    'status' => \App\Enums\PaymentStatus::Verified->value,
                    'verified_at' => now(),
                    'verified_by' => auth()->id() ?? $invoice->client_id,
                    'notes' => 'Auto-generated on invoice verification reference: ' . $invoice->payment_reference,
                ]);
            }

            $invoice->update(['status' => InvoiceStatus::Paid, 'paid_at' => now()]);

            return $invoice->refresh();
        });
    }

    public function cancel(Invoice $invoice): Invoice
    {
        if ($invoice->status === InvoiceStatus::Paid) {
            throw new DomainRuleException('A paid invoice cannot be cancelled.', 'INVOICE_PAID', 409);
        }

        $invoice->update(['status' => InvoiceStatus::Cancelled]);

        return $invoice->refresh();
    }

    /**
     * @param  array{status?: string|null}  $filters
     * @return LengthAwarePaginator<int, Invoice>
     */
    public function list(User $actor, array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Invoice::query()->with(['client', 'assignment']);

        if (!$this->isStaff($actor)) {
            $query->where('client_id', $actor->getKey());
        }

        $status = $filters['status'] ?? null;
        if (is_string($status) && in_array($status, InvoiceStatus::values(), true)) {
            $query->where('status', $status);
        }

        return $query->latest('id')->paginate($perPage);
    }

    /**
     * Money summary for the finance dashboard (scoped: clients see their own).
     *
     * @return array{currency: string, paidCents: int, outstandingCents: int, awaitingCents: int, invoiceCount: int}
     */
    public function summary(User $actor): array
    {
        $base = Invoice::query();
        if (!$this->isStaff($actor)) {
            $base->where('client_id', $actor->getKey());
        }

        $sumFor = fn (InvoiceStatus $status): int => (int) (clone $base)
            ->where('status', $status->value)->sum('amount_cents');

        return [
            'currency' => 'USD',
            'paidCents' => $sumFor(InvoiceStatus::Paid),
            'outstandingCents' => $sumFor(InvoiceStatus::Pending),
            'awaitingCents' => $sumFor(InvoiceStatus::AwaitingVerification),
            'invoiceCount' => (clone $base)->count(),
        ];
    }

    private function isStaff(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value);
    }

    private function nextNumber(): string
    {
        return 'INV-'.strtoupper(Str::random(8));
    }
}
