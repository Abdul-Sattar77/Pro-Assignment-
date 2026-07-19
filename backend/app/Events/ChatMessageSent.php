<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast a new direct-chat message to the other participant(s) in real time
 * over the private conversation channel. Broadcasts synchronously (Now) so it
 * works without a running queue worker. Payload is self-contained so the client
 * can render without a refetch; `mine` is computed client-side.
 */
final class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public readonly ChatMessage $message) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.conversation.'.$this->message->conversation->uuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $m = $this->message;

        return [
            'id' => $m->uuid,
            'conversationId' => $m->conversation->uuid,
            'type' => $m->type->value,
            'body' => $m->body,
            'senderId' => $m->sender?->uuid,
            'senderName' => $m->sender?->name,
            'attachment' => $m->path === null ? null : [
                'name' => $m->original_name,
                'mime' => $m->mime_type,
                'size' => $m->size,
                'url' => route('chat.messages.download', ['message' => $m->uuid]),
            ],
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }
}
