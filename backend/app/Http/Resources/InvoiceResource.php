<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\Role;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Invoice contract. `actions` lists what THIS viewer may do now so the UI
 * renders the right controls (client: pay; staff: verify/cancel).
 *
 * @mixin Invoice
 */
final class InvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User|null $viewer */
        $viewer = $request->user();
        $isStaff = $viewer !== null
            && ($viewer->hasRole(Role::Admin->value) || $viewer->hasRole(Role::ProjectManager->value));

        $actions = [];
        if ($viewer !== null) {
            if ($viewer->getKey() === $this->client_id && $this->status->value === 'pending') {
                $actions[] = 'submit_payment';
            }
            if ($isStaff && $this->status->value === 'awaiting_verification') {
                $actions[] = 'verify';
            }
            if ($isStaff && !in_array($this->status->value, ['paid', 'cancelled'], true)) {
                $actions[] = 'cancel';
            }
        }

        $totalPaid = $this->payments()
            ->where('status', \App\Enums\PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                \App\Enums\PaymentType::Advance->value,
                \App\Enums\PaymentType::Partial->value,
                \App\Enums\PaymentType::Balance->value,
            ])
            ->sum('amount');
        $paidAmountCents = (int) round($totalPaid * 100);

        // Fallback for legacy invoices marked as paid in the database without separate payment log records
        if ($this->status->value === 'paid' && $paidAmountCents === 0) {
            $paidAmountCents = $this->amount_cents;
        }

        $dueAmountCents = max(0, $this->amount_cents - $paidAmountCents);

        return [
            'id' => $this->uuid,
            'number' => $this->number,
            'amountCents' => $this->amount_cents,
            'paidAmountCents' => $paidAmountCents,
            'dueAmountCents' => $dueAmountCents,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'description' => $this->description,
            'paymentReference' => $this->when($isStaff, $this->payment_reference),
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'assignment' => $this->whenLoaded(
                'assignment',
                fn () => $this->assignment === null ? null : [
                    'id' => $this->assignment->uuid,
                    'title' => $this->assignment->title,
                ],
            ),
            'actions' => $actions,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
