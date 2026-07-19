<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * WebRTC call signaling (offer / answer / ICE candidate / hangup / reject)
 * delivered to the target user's private call channel. Synchronous so it works
 * without a queue worker. The payload is opaque SDP / ICE data plus caller info.
 */
final class CallSignal implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public readonly string $toUuid,
        public readonly array $data,
    ) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('calls.'.$this->toUuid)];
    }

    public function broadcastAs(): string
    {
        return 'call.signal';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return $this->data;
    }
}
