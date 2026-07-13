<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Enums\Role;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Message JSON resource.
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
        $actor = $request->user();
        $isAdmin = $actor !== null && $actor->hasRole(Role::Admin->value);

        // Visibility check for deleted messages: Admin sees raw text, others see a placeholder.
        $messageText = $this->message;
        if ($this->is_deleted) {
            $messageText = $isAdmin ? ($this->message ?? 'Empty message') : 'This message was deleted.';
        }

        $attachment = null;
        if ($this->relationLoaded('attachment') && $this->attachment !== null) {
            if (!$this->is_deleted || $isAdmin) {
                $attachment = [
                    'id' => $this->attachment->uuid,
                    'originalName' => $this->attachment->original_name,
                    'size' => $this->attachment->size,
                    'humanSize' => $this->attachment->human_size,
                    'mimeType' => $this->attachment->mime_type,
                    'downloadUrl' => $this->attachment->download_url,
                ];
            }
        }

        return [
            'id' => $this->uuid,
            'message' => $messageText,
            'messageType' => $this->message_type,
            'isDeleted' => $this->is_deleted,
            'createdAt' => $this->created_at?->toIso8601String(),
            'sender' => $this->sender === null ? null : [
                'id' => $this->sender->uuid,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
            ],
            'attachment' => $attachment,
        ];
    }
}
