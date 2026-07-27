<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\EmailAttachment;
use App\Models\EmailMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An email as the portal renders it.
 *
 * `sender` is the audit anchor: for portal-sent mail it names the rep. It is
 * null for inbound mail and for replies sent straight from Gmail — the latter
 * is flagged by `viaMailClient` so a blank author is never unexplained.
 *
 * @mixin EmailMessage
 */
final class EmailMessageResource extends JsonResource
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
            'outbound' => !$this->isInbound(),
            'mine' => $viewer !== null && $viewer->getKey() === $this->sender_id,
            'subject' => $this->subject,
            'snippet' => $this->snippet,
            'bodyText' => $this->body_text,
            'bodyHtml' => $this->body_html,
            'from' => [
                'email' => $this->from_email,
                'name' => $this->from_name,
            ],
            'to' => $this->to ?? [],
            'cc' => $this->cc ?? [],
            'sender' => $this->sender === null ? null : [
                'id' => $this->sender->uuid,
                'name' => $this->sender->name,
            ],
            'viaMailClient' => (bool) $this->via_mail_client,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'errorMessage' => $this->error_message,
            'attachments' => $this->whenLoaded(
                'attachments',
                fn () => $this->attachments->map(fn (EmailAttachment $a): array => [
                    'id' => $a->uuid,
                    'name' => $a->filename,
                    'mime' => $a->mime_type,
                    'size' => $a->size,
                    'stored' => $a->isStored(),
                    'url' => route('email.attachments.download', ['attachment' => $a->uuid]),
                ])->all(),
                [],
            ),
            // Present only for auditors — hidden messages are not sent to
            // anyone else in the first place.
            'deleted' => $this->trashed(),
            'deletedBy' => $this->deleter === null ? null : [
                'id' => $this->deleter->uuid,
                'name' => $this->deleter->name,
            ],
            'deletedAt' => $this->deleted_at?->toIso8601String(),
            'sentAt' => $this->sent_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
