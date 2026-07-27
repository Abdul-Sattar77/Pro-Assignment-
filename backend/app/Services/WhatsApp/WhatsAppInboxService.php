<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Enums\WhatsAppDirection;
use App\Enums\WhatsAppMessageStatus;
use App\Enums\WhatsAppMessageType;
use App\Events\WhatsAppMessageReceived;
use App\Exceptions\WhatsAppException;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppMessage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Portal-side operations on the WhatsApp inbox: listing threads, replying,
 * assigning reps, and the soft "delete" that keeps the audit trail intact.
 */
final class WhatsAppInboxService
{
    public function __construct(private readonly WhatsAppCloudApi $api) {}

    /**
     * Threads visible to a user, newest activity first.
     *
     * Admins (holders of `whatsapp.audit`) see everything; a rep sees their
     * own threads plus the unassigned queue.
     *
     * @return LengthAwarePaginator<int, WhatsAppContact>
     */
    public function conversations(User $user, bool $archived = false, ?string $search = null, int $perPage = 30): LengthAwarePaginator
    {
        return WhatsAppContact::query()
            ->visibleTo($user)
            ->where('is_archived', $archived)
            ->when($search !== null && $search !== '', function ($q) use ($search): void {
                $term = '%'.str_replace('%', '\%', $search).'%';
                $q->where(function ($inner) use ($term): void {
                    $inner->where('profile_name', 'ilike', $term)
                        ->orWhere('wa_id', 'like', $term)
                        ->orWhere('phone', 'like', $term);
                });
            })
            ->with(['assignee:id,uuid,name', 'user:id,uuid,name', 'latestMessage'])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Messages in a thread.
     *
     * Soft-deleted messages are included only for auditors — that is precisely
     * the "deleted by sales still shows for admin" requirement.
     *
     * @return Collection<int, WhatsAppMessage>
     */
    public function messages(User $user, WhatsAppContact $contact, int $limit = 200): Collection
    {
        return WhatsAppMessage::query()
            ->where('contact_id', $contact->id)
            ->when($user->can('whatsapp.audit'), fn ($q) => $q->withTrashed())
            ->with(['sender:id,uuid,name', 'deleter:id,uuid,name'])
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Reply to a thread as $sender.
     *
     * The message row is written *before* the API call and updated after, so a
     * send that fails mid-flight still leaves an auditable record of what a rep
     * attempted to send.
     *
     * @throws WhatsAppException
     */
    public function reply(User $sender, WhatsAppContact $contact, string $body, ?UploadedFile $file = null): WhatsAppMessage
    {
        $type = $file === null
            ? WhatsAppMessageType::Text
            : $this->mediaTypeFor($file->getMimeType());

        /** @var WhatsAppMessage $message */
        $message = DB::transaction(function () use ($contact, $sender, $body, $type): WhatsAppMessage {
            $message = WhatsAppMessage::query()->create([
                'contact_id' => $contact->id,
                'direction' => WhatsAppDirection::Outbound,
                'type' => $type,
                'body' => $body === '' ? null : $body,
                'sender_id' => $sender->id,
                'status' => WhatsAppMessageStatus::Pending,
            ]);

            $contact->forceFill(['last_message_at' => now()])->save();

            return $message;
        });

        // Store the attachment locally first: the audit copy must exist even
        // if Meta rejects the upload.
        if ($file !== null) {
            $this->storeOutboundMedia($message, $file);
        }

        try {
            $result = $file === null
                ? $this->api->sendText($contact->wa_id, $body)
                : $this->api->sendMedia(
                    $contact->wa_id,
                    $type->value,
                    $this->api->uploadMedia(
                        Storage::disk($message->disk)->path($message->path),
                        $message->mime_type ?? 'application/octet-stream',
                        $message->original_name ?? 'file',
                    ),
                    $body === '' ? null : $body,
                    $message->original_name,
                );

            $message->forceFill([
                'wamid' => $result['wamid'],
                'status' => WhatsAppMessageStatus::Sent,
                'sent_at' => now(),
                'payload' => $result['raw'],
            ])->save();
        } catch (WhatsAppException $e) {
            $message->forceFill([
                'status' => WhatsAppMessageStatus::Failed,
                'failed_at' => now(),
                'error_code' => $e->errorCode,
                'error_message' => $e->getMessage(),
            ])->save();

            throw $e;
        } finally {
            // Broadcast either way — a failed send should appear in the thread
            // immediately, flagged, rather than vanishing.
            WhatsAppMessageReceived::dispatch($message->fresh(['contact', 'sender']));
        }

        return $message->refresh();
    }

    /**
     * Send the billable re-engagement template to reopen a closed window.
     *
     * @param  array<int, string>  $parameters  positional {{1}}, {{2}} values
     *
     * @throws WhatsAppException
     */
    public function sendReopenTemplate(User $sender, WhatsAppContact $contact, array $parameters = []): WhatsAppMessage
    {
        $name = (string) config('whatsapp.templates.reopen.name');
        $language = (string) config('whatsapp.templates.reopen.language', 'en');

        $message = WhatsAppMessage::query()->create([
            'contact_id' => $contact->id,
            'direction' => WhatsAppDirection::Outbound,
            'type' => WhatsAppMessageType::Template,
            'body' => $parameters === [] ? "[template: {$name}]" : implode(' | ', $parameters),
            'sender_id' => $sender->id,
            'status' => WhatsAppMessageStatus::Pending,
            'is_template' => true,
            'template_name' => $name,
        ]);

        try {
            $result = $this->api->sendTemplate($contact->wa_id, $name, $language, $parameters);

            $message->forceFill([
                'wamid' => $result['wamid'],
                'status' => WhatsAppMessageStatus::Sent,
                'sent_at' => now(),
                'payload' => $result['raw'],
            ])->save();

            $contact->forceFill(['last_message_at' => now()])->save();
        } catch (WhatsAppException $e) {
            $message->forceFill([
                'status' => WhatsAppMessageStatus::Failed,
                'failed_at' => now(),
                'error_code' => $e->errorCode,
                'error_message' => $e->getMessage(),
            ])->save();

            throw $e;
        } finally {
            WhatsAppMessageReceived::dispatch($message->fresh(['contact', 'sender']));
        }

        return $message->refresh();
    }

    /** Assign (or unassign, with null) the rep who owns a thread. */
    public function assign(WhatsAppContact $contact, ?User $assignee): WhatsAppContact
    {
        // Not forceFill: this must go through the model so activitylog records
        // the reassignment.
        $contact->assigned_to = $assignee?->id;
        $contact->save();

        return $contact->refresh();
    }

    /**
     * Hide a message from the inbox.
     *
     * A soft delete by design: the row, its body and its sender attribution all
     * survive, `deleted_by` records who hid it, and admins still see it in the
     * thread and in the activity log. There is no hard-delete path anywhere in
     * this service.
     */
    public function hideMessage(User $actor, WhatsAppMessage $message): WhatsAppMessage
    {
        $message->deleted_by = $actor->id;
        $message->save();
        $message->delete();

        activity('whatsapp_message')
            ->performedOn($message)
            ->causedBy($actor)
            ->withProperties([
                'wamid' => $message->wamid,
                'direction' => $message->direction->value,
                'body' => $message->body,
            ])
            ->log('whatsapp message hidden from inbox');

        return $message;
    }

    /** Restore a hidden message (admin only). */
    public function restoreMessage(User $actor, WhatsAppMessage $message): WhatsAppMessage
    {
        $message->restore();
        $message->deleted_by = null;
        $message->save();

        activity('whatsapp_message')
            ->performedOn($message)
            ->causedBy($actor)
            ->log('whatsapp message restored to inbox');

        return $message->refresh();
    }

    /** Archive/unarchive a thread — a view-state flag, never a delete. */
    public function setArchived(User $actor, WhatsAppContact $contact, bool $archived): WhatsAppContact
    {
        $contact->is_archived = $archived;
        $contact->archived_by = $archived ? $actor->id : null;
        $contact->archived_at = $archived ? now() : null;
        $contact->save();

        activity('whatsapp_contact')
            ->performedOn($contact)
            ->causedBy($actor)
            ->log($archived ? 'whatsapp thread archived' : 'whatsapp thread unarchived');

        return $contact->refresh();
    }

    /** Mark a thread read for this user, and blue-tick the customer's side. */
    public function markRead(User $user, WhatsAppContact $contact): void
    {
        $contact->readers()->syncWithoutDetaching([
            $user->id => ['last_read_at' => now()],
        ]);

        if (!config('whatsapp.send_read_receipts', true)) {
            return;
        }

        $latestInbound = WhatsAppMessage::query()
            ->where('contact_id', $contact->id)
            ->where('direction', WhatsAppDirection::Inbound)
            ->whereNotNull('wamid')
            ->latest('id')
            ->first();

        if ($latestInbound?->wamid !== null) {
            $this->api->markRead($latestInbound->wamid);
        }
    }

    /** How many inbound messages this user has not seen in a thread. */
    public function unreadCountFor(User $user, WhatsAppContact $contact): int
    {
        // Read the pivot directly rather than hydrating a User just to reach
        // its pivot attributes.
        $lastRead = DB::table('whatsapp_contact_reads')
            ->where('contact_id', $contact->getKey())
            ->where('user_id', $user->getKey())
            ->value('last_read_at');

        return WhatsAppMessage::query()
            ->where('contact_id', $contact->id)
            ->where('direction', WhatsAppDirection::Inbound)
            ->when($lastRead !== null, fn ($q) => $q->where('created_at', '>', $lastRead))
            ->count();
    }

    /** Persist an outbound attachment to the private disk before sending. */
    private function storeOutboundMedia(WhatsAppMessage $message, UploadedFile $file): void
    {
        $disk = (string) config('whatsapp.media.disk', 'local');
        $dir = trim((string) config('whatsapp.media.directory', 'whatsapp'), '/');

        $path = $file->store("{$dir}/outbound", $disk);

        $message->forceFill([
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ])->save();
    }

    /** Map a MIME type onto the Cloud API's media category. */
    private function mediaTypeFor(?string $mime): WhatsAppMessageType
    {
        return match (true) {
            $mime === null => WhatsAppMessageType::Document,
            str_starts_with($mime, 'image/') => WhatsAppMessageType::Image,
            str_starts_with($mime, 'video/') => WhatsAppMessageType::Video,
            str_starts_with($mime, 'audio/') => WhatsAppMessageType::Audio,
            default => WhatsAppMessageType::Document,
        };
    }
}
