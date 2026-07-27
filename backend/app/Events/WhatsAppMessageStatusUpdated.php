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
 * Meta reported a delivery-state change (sent / delivered / read / failed) for
 * an outbound message. Lets the inbox update its ticks without polling.
 */
final class WhatsAppMessageStatusUpdated implements ShouldBroadcastNow
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
        return 'whatsapp.status';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        $m = $this->message;

        return [
            'id' => $m->uuid,
            'conversationId' => $m->contact?->uuid,
            'status' => $m->status->value,
            'errorMessage' => $m->error_message,
        ];
    }
}
