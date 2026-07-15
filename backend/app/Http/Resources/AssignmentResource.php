<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Assignment;
use App\Models\User;
use App\Services\Assignments\AssignmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Assignment JSON contract. Includes `actions` — the workflow buttons THIS
 * viewer may use right now (computed by the service's state rules) — so every
 * role's UI renders exactly what it can do without duplicating the state
 * machine on the frontend.
 *
 * @mixin Assignment
 */
final class AssignmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User|null $viewer */
        $viewer = $request->user();

        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'subject' => $this->subject,
            'type' => $this->type?->value,
            'typeLabel' => $this->type?->label(),
            'academicLevel' => $this->academic_level?->value,
            'academicLevelLabel' => $this->academic_level?->label(),
            'course' => $this->course,
            'university' => $this->university,
            'wordCount' => $this->word_count,
            'referencingStyle' => $this->referencing_style,
            'priority' => $this->priority->value,
            'priorityLabel' => $this->priority->label(),
            'contactPhone' => $this->contact_phone,
            'contactWhatsapp' => $this->contact_whatsapp,
            'description' => $this->description,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'deadline' => $this->deadline->toIso8601String(),
            'client' => $this->whenLoaded('client', fn () => [
                'id' => $this->client?->uuid,
                'name' => $this->client?->name,
            ]),
            'writer' => $this->whenLoaded('writer', fn () => $this->writer === null ? null : [
                'id' => $this->writer->uuid,
                'name' => $this->writer->name,
            ]),
            'projectManager' => $this->whenLoaded('projectManager', fn () => $this->projectManager === null ? null : [
                'id' => $this->projectManager->uuid,
                'name' => $this->projectManager->name,
            ]),
            'events' => AssignmentEventResource::collection($this->whenLoaded('events')),
            'actions' => $viewer === null
                ? []
                : app(AssignmentService::class)->allowedActionsFor($viewer, $this->resource),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
