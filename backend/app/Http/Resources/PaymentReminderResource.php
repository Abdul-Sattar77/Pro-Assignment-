<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PaymentReminder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PaymentReminder
 */
final class PaymentReminderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'invoiceId' => $this->invoice?->uuid,
            'type' => $this->type,
            'status' => $this->status,
            'notes' => $this->notes,
            'sentAt' => $this->sent_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'invoice' => $this->invoice === null ? null : [
                'id' => $this->invoice->uuid,
                'number' => $this->invoice->number,
                'amount' => $this->invoice->amount_cents / 100,
            ],
            'client' => $this->client === null ? null : [
                'id' => $this->client->uuid,
                'name' => $this->client->name,
                'email' => $this->client->email,
            ],
        ];
    }
}
