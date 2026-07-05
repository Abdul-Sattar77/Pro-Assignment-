<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AssignmentEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Timeline entry contract.
 *
 * @mixin AssignmentEvent
 */
final class AssignmentEventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'label' => $this->type->label(),
            'note' => $this->note,
            'actor' => $this->whenLoaded('actor', fn () => [
                'name' => $this->actor?->name,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
