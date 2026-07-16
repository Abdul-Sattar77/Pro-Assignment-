<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ChatConversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A 1:1 conversation from the viewer's perspective: the OTHER participant, the
 * last message preview, and the viewer's unread count (set as `unread_count`).
 *
 * @mixin ChatConversation
 */
final class ChatConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User|null $viewer */
        $viewer = $request->user();

        /** @var User|null $other */
        $other = $this->participants
            ->first(fn (User $p): bool => $viewer === null || $p->getKey() !== $viewer->getKey());

        $last = $this->latestMessage;

        return [
            'id' => $this->uuid,
            'contact' => $other === null ? null : [
                'id' => $other->uuid,
                'name' => $other->name,
                'role' => $other->getRoleNames()->first(),
            ],
            'lastMessage' => $last === null ? null : [
                'type' => $last->type->value,
                'body' => $last->body,
                'mine' => $viewer !== null && $viewer->getKey() === $last->sender_id,
                'createdAt' => $last->created_at?->toIso8601String(),
            ],
            'unreadCount' => (int) ($this->unread_count ?? 0),
            'lastMessageAt' => $this->last_message_at?->toIso8601String(),
        ];
    }
}
