<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lead JSON resource contract.
 *
 * @mixin Lead
 */
final class LeadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'source' => $this->source->value,
            'sourceLabel' => $this->source->label(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'notes' => $this->notes,
            'lostReason' => $this->lost_reason,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
