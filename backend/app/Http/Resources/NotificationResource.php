<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;

/**
 * In-app notification contract.
 *
 * @mixin DatabaseNotification
 */
final class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $data */
        $data = $this->data;

        return [
            'id' => $this->id,
            'title' => $data['title'] ?? 'Update',
            'message' => $data['message'] ?? '',
            'assignmentId' => $data['assignmentId'] ?? null,
            'read' => $this->read_at !== null,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
