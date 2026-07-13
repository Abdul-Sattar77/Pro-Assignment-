<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Invoice JSON resource contract.
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
        return [
            'id' => $this->uuid,
            'invoiceNumber' => $this->invoice_number,
            'amount' => (float) $this->amount,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'dueDate' => $this->due_date?->toIso8601String(),
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'client' => $this->whenLoaded('client', fn () => $this->client === null ? null : [
                'id' => $this->client->uuid,
                'name' => $this->client->name,
                'email' => $this->client->email,
            ]),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
                'clientPrice' => (float) $this->assignment->client_price,
                'writerCost' => (float) $this->assignment->writer_cost,
                'discount' => (float) $this->assignment->discount,
                'netProfit' => (float) $this->assignment->net_profit,
            ]),
        ];
    }
}
