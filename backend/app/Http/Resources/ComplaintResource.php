<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Complaint JSON resource.
 *
 * @mixin Complaint
 */
final class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'client' => $this->client === null ? null : [
                'id' => $this->client->uuid,
                'name' => $this->client->name,
                'email' => $this->client->email,
            ],
            'assignment' => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ],
            'projectManager' => $this->projectManager === null ? null : [
                'id' => $this->projectManager->uuid,
                'name' => $this->projectManager->name,
            ],
            'subject' => $this->subject,
            'description' => $this->description,
            'status' => $this->status,
            'resolution' => $this->resolution,
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
            'resolverName' => $this->resolver?->name,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
