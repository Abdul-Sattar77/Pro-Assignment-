<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Calendar Event JSON mapper.
 *
 * @mixin CalendarEvent
 */
final class CalendarEventResource extends JsonResource
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
            'eventType' => $this->event_type->value,
            'eventTypeLabel' => $this->event_type->label(),
            'startDate' => $this->start_date->toIso8601String(),
            'endDate' => $this->end_date?->toIso8601String(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ]),
            'task' => $this->whenLoaded('task', fn () => $this->task === null ? null : [
                'id' => $this->task->uuid,
                'title' => $this->task->title,
            ]),
            'user' => $this->whenLoaded('user', fn () => $this->user === null ? null : [
                'id' => $this->user->uuid,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator?->uuid,
                'name' => $this->creator?->name,
                'email' => $this->creator?->email,
            ]),
        ];
    }
}
