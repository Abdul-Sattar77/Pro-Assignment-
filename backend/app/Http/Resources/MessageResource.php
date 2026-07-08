<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Message contract. `mine` lets the UI align the bubble without knowing ids.
 *
 * @mixin Message
 */
final class MessageResource extends JsonResource
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
            'body' => $this->body,
            'sender' => $this->whenLoaded('sender', fn () => $this->sender?->name),
            'mine' => $viewer !== null && $viewer->getKey() === $this->sender_id,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
