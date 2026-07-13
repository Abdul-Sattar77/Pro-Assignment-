<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Payment JSON resource contract.
 *
 * @mixin Payment
 */
final class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'amount' => (float) $this->amount,
            'paymentMethod' => $this->payment_method,
            'paymentType' => $this->payment_type->value,
            'paymentTypeLabel' => $this->payment_type->label(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'verifiedAt' => $this->verified_at?->toIso8601String(),
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ]),
            'invoice' => $this->whenLoaded('invoice', fn () => $this->invoice === null ? null : [
                'id' => $this->invoice->uuid,
                'invoiceNumber' => $this->invoice->invoice_number,
                'amount' => (float) $this->invoice->amount,
            ]),
            'user' => $this->whenLoaded('user', fn () => $this->user === null ? null : [
                'id' => $this->user->uuid,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'verifiedBy' => $this->whenLoaded('verifiedBy', fn () => $this->verifiedBy === null ? null : [
                'id' => $this->verifiedBy->uuid,
                'name' => $this->verifiedBy->name,
            ]),
            'proofFile' => $this->whenLoaded('proofFile', fn () => $this->proofFile === null ? null : FileResource::make($this->proofFile)),
        ];
    }
}
