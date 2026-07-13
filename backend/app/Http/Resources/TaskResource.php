<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Task JSON resource contract.
 *
 * @mixin Task
 */
final class TaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority->value,
            'priorityLabel' => $this->priority->label(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'dueDate' => $this->due_date?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'notes' => $this->notes,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ]),
            'assignedUser' => $this->whenLoaded('assignedUser', fn () => $this->assignedUser === null ? null : [
                'id' => $this->assignedUser->uuid,
                'name' => $this->assignedUser->name,
                'email' => $this->assignedUser->email,
            ]),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator?->uuid,
                'name' => $this->creator?->name,
                'email' => $this->creator?->email,
            ]),
        ];
    }
}
