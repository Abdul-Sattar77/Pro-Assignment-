<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\EmailThread;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An email conversation in the inbox list.
 *
 * @mixin EmailThread
 */
final class EmailThreadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $last = $this->latestMessage;

        return [
            'id' => $this->uuid,
            'subject' => $this->subject ?? '(no subject)',
            'contact' => [
                'email' => $this->contact_email,
                'name' => $this->contact_name ?? $this->contact_email,
            ],
            // The sales rep who owns this thread; null = unassigned queue.
            'assignedTo' => $this->assignee === null ? null : [
                'id' => $this->assignee->uuid,
                'name' => $this->assignee->name,
            ],
            // Set when the address matches an existing portal user.
            'portalUser' => $this->user === null ? null : [
                'id' => $this->user->uuid,
                'name' => $this->user->name,
            ],
            'lastMessage' => $last === null ? null : [
                'snippet' => $last->snippet,
                'outbound' => !$last->isInbound(),
                'status' => $last->status->value,
                'fromName' => $last->from_name ?? $last->from_email,
                'createdAt' => $last->created_at?->toIso8601String(),
            ],
            'messageCount' => (int) $this->message_count,
            'unreadCount' => (int) ($this->unread_count ?? 0),
            'isArchived' => (bool) $this->is_archived,
            'lastMessageAt' => $this->last_message_at?->toIso8601String(),
            'lastInboundAt' => $this->last_inbound_at?->toIso8601String(),
        ];
    }
}
