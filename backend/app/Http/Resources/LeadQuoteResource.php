<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\LeadQuote;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * LeadQuote JSON resource contract.
 *
 * @mixin LeadQuote
 */
final class LeadQuoteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'amount' => (float) $this->amount,
            'notes' => $this->notes,
            'createdBy' => $this->creator?->name,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
