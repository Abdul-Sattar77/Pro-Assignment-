<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\WhatsAppMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * A WhatsApp message landed in (or left) the portal inbox.
 *
 * Broadcast on a single shared `whatsapp.inbox` channel rather than per-thread:
 * the inbox is a team queue, so every authorised rep needs the conversation
 * list to reorder live even for threads they have not opened. Channel
 * authorisation (routes/channels.php) gates it to `whatsapp.view` holders.
 *
 * Broadcasts synchronously (Now) so it works without a queue worker running,
 * matching {@see ChatMessageSent}.
 */
final class WhatsAppMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public readonly WhatsAppMessage $message) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('whatsapp.inbox')];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.message';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $m = $this->message;
        $contact = $m->contact;

        return [
            'id' => $m->uuid,
            'conversationId' => $contact?->uuid,
            'waId' => $contact?->wa_id,
            'contactName' => $contact === null
                ? null
                : ($contact->profile_name ?? $contact->phone),
            'direction' => $m->direction->value,
            'type' => $m->type->value,
            'body' => $m->body,
            'status' => $m->status->value,
            // Null for inbound: the customer sent it, not a rep.
            'sender' => $m->sender === null ? null : [
                'id' => $m->sender->uuid,
                'name' => $m->sender->name,
            ],
            'hasMedia' => $m->path !== null,
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }
}
