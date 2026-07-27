<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WhatsAppContact;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A WhatsApp thread in the inbox list.
 *
 * Carries the service-window state so the UI can disable free-form replies
 * (and warn about the billable template path) before the rep types anything.
 *
 * @mixin WhatsAppContact
 */
final class WhatsAppConversationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $last = $this->latestMessage;

        return [
            'id' => $this->uuid,
            'waId' => $this->wa_id,
            'phone' => $this->phone,
            'name' => $this->profile_name ?? $this->phone ?? $this->wa_id,
            'profileName' => $this->profile_name,
            // The sales rep who owns this thread; null = unassigned queue.
            'assignedTo' => $this->assignee === null ? null : [
                'id' => $this->assignee->uuid,
                'name' => $this->assignee->name,
            ],
            // Set when the number matches an existing portal user.
            'portalUser' => $this->user === null ? null : [
                'id' => $this->user->uuid,
                'name' => $this->user->name,
            ],
            'lastMessage' => $last === null ? null : [
                'type' => $last->type->value,
                'body' => $last->body ?? $last->type->previewLabel(),
                'outbound' => !$last->isInbound(),
                'status' => $last->status->value,
                'createdAt' => $last->created_at?->toIso8601String(),
            ],
            'unreadCount' => (int) ($this->unread_count ?? 0),
            'isArchived' => (bool) $this->is_archived,
            // True while free-form replies are deliverable and free of charge.
            'withinServiceWindow' => $this->isWithinServiceWindow(),
            'serviceWindowExpiresAt' => $this->serviceWindowExpiresAt()?->toIso8601String(),
            'lastMessageAt' => $this->last_message_at?->toIso8601String(),
            'lastInboundAt' => $this->last_inbound_at?->toIso8601String(),
        ];
    }
}
