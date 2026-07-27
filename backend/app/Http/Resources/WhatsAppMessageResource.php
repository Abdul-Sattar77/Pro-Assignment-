<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use App\Models\WhatsAppMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A WhatsApp message as the portal renders it.
 *
 * `sender` is the audit anchor: for outbound messages it names the sales rep
 * who sent it, and it is never null for a rep-authored message. `deletedBy` is
 * only populated for auditors, who are the only ones who receive hidden rows.
 *
 * @mixin WhatsAppMessage
 */
final class WhatsAppMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User|null $viewer */
        $viewer = $request->user();

        return [
            'id' => $this->uuid,
            'direction' => $this->direction->value,
            'type' => $this->type->value,
            'body' => $this->body,
            // Outbound sits on the right in the thread, like WhatsApp itself.
            'outbound' => !$this->isInbound(),
            'mine' => $viewer !== null && $viewer->getKey() === $this->sender_id,
            'sender' => $this->sender === null ? null : [
                'id' => $this->sender->uuid,
                'name' => $this->sender->name,
            ],
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'errorMessage' => $this->error_message,
            'isTemplate' => (bool) $this->is_template,
            'templateName' => $this->template_name,
            // Sent from the WhatsApp Business phone app under Coexistence, so
            // there is deliberately no rep attribution — see the migration.
            'viaBusinessApp' => (bool) $this->via_business_app,
            'editedAt' => $this->edited_at?->toIso8601String(),
            'attachment' => $this->path === null ? null : [
                'name' => $this->original_name,
                'mime' => $this->mime_type,
                'size' => $this->size,
                'url' => route('whatsapp.messages.download', ['message' => $this->uuid]),
            ],
            // Present only when the viewer can audit — hidden messages are not
            // sent to non-auditors at all.
            'deleted' => $this->trashed(),
            'deletedBy' => $this->deleter === null ? null : [
                'id' => $this->deleter->uuid,
                'name' => $this->deleter->name,
            ],
            'deletedAt' => $this->deleted_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'sentAt' => $this->sent_at?->toIso8601String(),
        ];
    }
}
