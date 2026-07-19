<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Conversation;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

/**
 * Conversation JSON resource.
 *
 * @mixin Conversation
 */
final class ConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $actor = $request->user();
        $unreadCount = 0;

        if ($actor !== null) {
            // Retrieve unread count via repository check
            $repo = app(ConversationRepositoryInterface::class);
            $unreadCount = $repo->getUnreadCountFor($actor);

            // To get count specifically for this conversation, we query the unread logic:
            $unreadCount = DB::table('messages')
                ->where('conversation_id', $this->id)
                ->where('sender_id', '!=', $actor->getKey())
                ->where('is_deleted', false)
                ->where(function ($query) use ($actor): void {
                    $query->whereNotExists(function ($subQuery) use ($actor): void {
                        $subQuery->select(DB::raw(1))
                            ->from('conversation_participants')
                            ->whereColumn('conversation_participants.conversation_id', 'messages.conversation_id')
                            ->where('conversation_participants.user_id', $actor->getKey())
                            ->whereNotNull('conversation_participants.last_read_at')
                            ->whereColumn('conversation_participants.last_read_at', '>=', 'messages.created_at');
                    });
                })
                ->count();
        }

        return [
            'id' => $this->uuid,
            'type' => $this->type,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'unreadCount' => $unreadCount,
            'assignment' => [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
                'status' => $this->assignment->status,
            ],
            'latestMessage' => $this->relationLoaded('latestMessage') && $this->latestMessage !== null
                ? [
                    'id' => $this->latestMessage->uuid,
                    'message' => $this->latestMessage->is_deleted
                        ? 'This message was deleted.'
                        : $this->latestMessage->message,
                    'messageType' => $this->latestMessage->message_type,
                    'createdAt' => $this->latestMessage->created_at?->toIso8601String(),
                    'sender' => [
                        'name' => $this->latestMessage->sender?->name ?? 'System',
                        'email' => $this->latestMessage->sender?->email ?? '',
                    ],
                ]
                : null,
        ];
    }
}
