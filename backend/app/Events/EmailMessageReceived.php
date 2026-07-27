<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\EmailMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * An email landed in (or left) the shared inbox.
 *
 * Broadcast on one shared `email.inbox` channel rather than per-thread: the
 * inbox is a team queue, so every authorised rep needs the list to reorder
 * live. Channel authorisation (routes/channels.php) gates it to `email.view`.
 */
final class EmailMessageReceived implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public readonly EmailMessage $message) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('email.inbox')];
    }

    public function broadcastAs(): string
    {
        return 'email.message';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $m = $this->message;
        $thread = $m->thread;

        return [
            'id' => $m->uuid,
            'threadId' => $thread?->uuid,
            'subject' => $m->subject,
            'snippet' => $m->snippet,
            'direction' => $m->direction->value,
            'status' => $m->status->value,
            'fromEmail' => $m->from_email,
            'fromName' => $m->from_name,
            // Null for inbound and for mail sent straight from Gmail.
            'sender' => $m->sender === null ? null : [
                'id' => $m->sender->uuid,
                'name' => $m->sender->name,
            ],
            'createdAt' => $m->created_at?->toIso8601String(),
        ];
    }
}
