<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ChatMessage
 */
final class ChatMessageResource extends JsonResource
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
            'type' => $this->type->value,
            'body' => $this->body,
            'mine' => $viewer !== null && $viewer->getKey() === $this->sender_id,
            'sender' => [
                'id' => $this->sender?->uuid,
                'name' => $this->sender?->name,
            ],
            'attachment' => $this->path === null ? null : [
                'name' => $this->original_name,
                'mime' => $this->mime_type,
                'size' => $this->size,
                'url' => route('chat.messages.download', ['message' => $this->uuid]),
            ],
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
