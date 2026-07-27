<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Enums\WhatsAppDirection;
use App\Enums\WhatsAppMessageStatus;
use App\Enums\WhatsAppMessageType;
use App\Events\WhatsAppMessageReceived;
use App\Events\WhatsAppMessageStatusUpdated;
use App\Models\User;
use App\Models\WhatsAppContact;
use App\Models\WhatsAppMessage;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Translates Meta webhook payloads into portal records.
 *
 * Two hard rules, both driven by how Meta actually behaves:
 *  1. **Idempotent.** Meta retries a webhook until it gets a 200, so the same
 *     message id can arrive many times. Dedup is on the unique `wamid`.
 *  2. **Never throw.** A 4xx/5xx from us makes Meta retry the whole batch and
 *     eventually disable the webhook. One malformed entry is logged and
 *     skipped; the rest of the batch still processes.
 */
final class WhatsAppWebhookProcessor
{
    public function __construct(private readonly WhatsAppCloudApi $api) {}

    /**
     * Process a full webhook body.
     *
     * @param  array<string, mixed>  $payload
     * @return array{messages: int, statuses: int, echoes: int}
     */
    public function process(array $payload): array
    {
        $messages = 0;
        $statuses = 0;
        $echoes = 0;

        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $field = $change['field'] ?? null;
                $value = $change['value'] ?? [];

                switch ($field) {
                    case 'messages':
                        // Profile names arrive alongside, keyed by wa_id.
                        $profiles = $this->indexProfiles($value['contacts'] ?? []);

                        foreach ($value['messages'] ?? [] as $raw) {
                            if ($this->handleInbound($raw, $profiles)) {
                                $messages++;
                            }
                        }

                        foreach ($value['statuses'] ?? [] as $raw) {
                            if ($this->handleStatus($raw)) {
                                $statuses++;
                            }
                        }
                        break;

                    case 'smb_message_echoes':
                        // Coexistence: staff replied from the phone app.
                        foreach ($value['message_echoes'] ?? [] as $raw) {
                            if ($this->handleEcho($raw)) {
                                $echoes++;
                            }
                        }
                        break;

                    case 'account_offboarded':
                    case 'account_reconnected':
                        $this->handleAccountEvent($field, $value);
                        break;

                    default:
                        // account_update, template status, quality signals…
                        break;
                }
            }
        }

        return ['messages' => $messages, 'statuses' => $statuses, 'echoes' => $echoes];
    }

    /**
     * Handle a message the business sent from the WhatsApp Business phone app
     * (Coexistence). Three shapes share this webhook: a new message, an `edit`
     * of one, and a `revoke` (deleted on the phone).
     *
     * Crucially, a revoke does NOT remove our row — it soft-deletes, so a
     * message deleted on someone's phone is still there for the admin. That is
     * the same guarantee the portal's own delete gives.
     *
     * @param  array<string, mixed>  $raw
     */
    private function handleEcho(array $raw): bool
    {
        $type = (string) ($raw['type'] ?? '');

        try {
            return match ($type) {
                'revoke' => $this->handleEchoRevoke($raw),
                'edit' => $this->handleEchoEdit($raw),
                default => $this->handleEchoMessage($raw),
            };
        } catch (Throwable $e) {
            Log::error('WhatsApp echo processing failed.', [
                'wamid' => $raw['id'] ?? null,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Store a new phone-app-sent message as outbound.
     *
     * `sender_id` stays null and `via_business_app` is set: the portal cannot
     * know which staff member tapped send on a shared phone, and pretending
     * otherwise would put a false name in the audit trail.
     *
     * @param  array<string, mixed>  $raw
     */
    private function handleEchoMessage(array $raw): bool
    {
        $wamid = $raw['id'] ?? null;
        // `from` is the business number here; the customer is `to`.
        $waId = $raw['to'] ?? null;

        if (!is_string($wamid) || !is_string($waId) || $wamid === '' || $waId === '') {
            Log::warning('WhatsApp echo missing id/to.', ['raw' => $raw]);

            return false;
        }

        if (WhatsAppMessage::withTrashed()->where('wamid', $wamid)->exists()) {
            return false; // retry, or the portal already recorded this send
        }

        $contact = $this->resolveContact($waId, null);
        $type = WhatsAppMessageType::fromMeta($raw['type'] ?? null);
        $sentAt = isset($raw['timestamp'])
            ? Carbon::createFromTimestamp((int) $raw['timestamp'])
            : now();

        $message = WhatsAppMessage::query()->create([
            'contact_id' => $contact->id,
            'wamid' => $wamid,
            'context_wamid' => $raw['context']['id'] ?? null,
            'direction' => WhatsAppDirection::Outbound,
            'type' => $type,
            'body' => $this->extractBody($raw, $type),
            'sender_id' => null,
            'via_business_app' => true,
            // It left WhatsApp already; delivery callbacks may still follow.
            'status' => WhatsAppMessageStatus::Sent,
            'sent_at' => $sentAt,
            'payload' => $raw,
        ]);

        if ($type->hasMedia()) {
            $this->mirrorInboundMedia($message, $raw, $type);
        }

        // Does NOT touch last_inbound_at — a business reply never reopens the
        // 24-hour customer service window; only the customer can do that.
        $contact->forceFill(['last_message_at' => $sentAt])->save();

        WhatsAppMessageReceived::dispatch($message->fresh(['contact', 'sender']));

        return true;
    }

    /**
     * Staff deleted a sent message from their phone. Soft-delete ours so it
     * disappears from the working inbox but survives for the admin audit.
     *
     * @param  array<string, mixed>  $raw
     */
    private function handleEchoRevoke(array $raw): bool
    {
        $originalId = $this->originalMessageId($raw, 'revoke');

        if ($originalId === null) {
            return false;
        }

        /** @var WhatsAppMessage|null $message */
        $message = WhatsAppMessage::query()->where('wamid', $originalId)->first();

        if ($message === null) {
            return false; // already hidden, or predates the integration
        }

        $message->delete();

        activity('whatsapp_message')
            ->performedOn($message)
            ->withProperties([
                'wamid' => $message->wamid,
                'body' => $message->body,
                'source' => 'whatsapp_business_app',
            ])
            ->log('whatsapp message deleted from the phone app (retained for audit)');

        return true;
    }

    /**
     * Staff edited a sent message on their phone. Apply the new content; the
     * activity log keeps the previous value.
     *
     * @param  array<string, mixed>  $raw
     */
    private function handleEchoEdit(array $raw): bool
    {
        $originalId = $this->originalMessageId($raw, 'edit');

        if ($originalId === null) {
            return false;
        }

        /** @var WhatsAppMessage|null $message */
        $message = WhatsAppMessage::withTrashed()->where('wamid', $originalId)->first();

        if ($message === null) {
            return false;
        }

        $edit = is_array($raw['edit'] ?? null) ? $raw['edit'] : $raw;
        $updated = is_array($edit['message'] ?? null) ? $edit['message'] : $edit;
        $type = WhatsAppMessageType::fromMeta($updated['type'] ?? $message->type->value);

        $message->body = $this->extractBody($updated, $type);
        $message->edited_at = now();
        $message->save();

        return true;
    }

    /**
     * Pull `original_message_id` from either the nested action object or the
     * echo root — Meta has shipped both shapes.
     *
     * @param  array<string, mixed>  $raw
     */
    private function originalMessageId(array $raw, string $key): ?string
    {
        $nested = is_array($raw[$key] ?? null) ? $raw[$key] : [];
        $id = $nested['original_message_id'] ?? $raw['original_message_id'] ?? null;

        if (!is_string($id) || $id === '') {
            Log::warning('WhatsApp echo missing original_message_id.', ['raw' => $raw]);

            return null;
        }

        return $id;
    }

    /**
     * The Coexistence link dropped or came back.
     *
     * Meta cuts the API connection if nobody opens the WhatsApp Business app
     * for ~14 days, which otherwise looks like "the portal silently stopped
     * receiving messages". Logged loudly so it is diagnosable.
     *
     * @param  array<string, mixed>  $value
     */
    private function handleAccountEvent(string $field, array $value): void
    {
        if ($field === 'account_offboarded') {
            Log::critical('WhatsApp Coexistence link OFFBOARDED — the portal will stop receiving messages until it is reconnected.', [
                'value' => $value,
            ]);

            return;
        }

        Log::info('WhatsApp Coexistence link reconnected.', ['value' => $value]);
    }

    /**
     * Store one inbound message.
     *
     * @param  array<string, mixed>  $raw
     * @param  array<string, string>  $profiles
     */
    private function handleInbound(array $raw, array $profiles): bool
    {
        $wamid = $raw['id'] ?? null;
        $waId = $raw['from'] ?? null;

        if (!is_string($wamid) || !is_string($waId) || $wamid === '' || $waId === '') {
            Log::warning('WhatsApp inbound message missing id/from.', ['raw' => $raw]);

            return false;
        }

        // Fast path for the common retry case.
        if (WhatsAppMessage::withTrashed()->where('wamid', $wamid)->exists()) {
            return false;
        }

        try {
            $contact = $this->resolveContact($waId, $profiles[$waId] ?? null);
            $type = WhatsAppMessageType::fromMeta($raw['type'] ?? null);
            $sentAt = isset($raw['timestamp'])
                ? Carbon::createFromTimestamp((int) $raw['timestamp'])
                : now();

            $message = WhatsAppMessage::query()->create([
                'contact_id' => $contact->id,
                'wamid' => $wamid,
                'context_wamid' => $raw['context']['id'] ?? null,
                'direction' => WhatsAppDirection::Inbound,
                'type' => $type,
                'body' => $this->extractBody($raw, $type),
                // Inbound has no portal sender — the customer wrote it.
                'sender_id' => null,
                // Arrival IS delivery for inbound.
                'status' => WhatsAppMessageStatus::Delivered,
                'sent_at' => $sentAt,
                'delivered_at' => $sentAt,
                'payload' => $raw,
            ]);

            if ($type->hasMedia()) {
                $this->mirrorInboundMedia($message, $raw, $type);
            }

            $contact->forceFill([
                'last_message_at' => $sentAt,
                // Refreshes the free 24-hour reply window.
                'last_inbound_at' => $sentAt,
                // A new message pulls an archived thread back into the inbox.
                'is_archived' => false,
                'archived_at' => null,
                'archived_by' => null,
            ])->save();

            WhatsAppMessageReceived::dispatch($message->fresh(['contact', 'sender']));

            return true;
        } catch (QueryException $e) {
            // Concurrent duplicate delivery lost the unique-index race. Benign.
            Log::info('WhatsApp inbound duplicate ignored.', ['wamid' => $wamid]);

            return false;
        } catch (Throwable $e) {
            Log::error('WhatsApp inbound processing failed.', [
                'wamid' => $wamid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Apply a delivery-status callback to the matching outbound message.
     *
     * @param  array<string, mixed>  $raw
     */
    private function handleStatus(array $raw): bool
    {
        $wamid = $raw['id'] ?? null;
        $status = WhatsAppMessageStatus::tryFrom((string) ($raw['status'] ?? ''));

        if (!is_string($wamid) || $status === null) {
            return false;
        }

        try {
            /** @var WhatsAppMessage|null $message */
            $message = WhatsAppMessage::withTrashed()->where('wamid', $wamid)->first();

            if ($message === null) {
                return false;
            }

            $at = isset($raw['timestamp'])
                ? Carbon::createFromTimestamp((int) $raw['timestamp'])
                : now();

            if ($status === WhatsAppMessageStatus::Failed) {
                $error = $raw['errors'][0] ?? [];
                $message->forceFill([
                    'error_code' => isset($error['code']) ? (string) $error['code'] : null,
                    'error_message' => (string) ($error['error_data']['details'] ?? $error['title'] ?? 'Delivery failed.'),
                ])->save();
            }

            if (!$message->advanceStatus($status, $at)) {
                return false; // out-of-order callback; already past this state
            }

            WhatsAppMessageStatusUpdated::dispatch($message->fresh('contact'));

            return true;
        } catch (Throwable $e) {
            Log::error('WhatsApp status processing failed.', [
                'wamid' => $wamid,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Find or create the thread for a number, linking it to an existing portal
     * user or lead when the phone number matches one.
     */
    private function resolveContact(string $waId, ?string $profileName): WhatsAppContact
    {
        $contact = WhatsAppContact::query()->firstOrCreate(
            ['wa_id' => $waId],
            [
                'phone' => '+'.$waId,
                'profile_name' => $profileName,
                'user_id' => $this->matchPortalUser($waId)?->id,
            ],
        );

        // Customers rename themselves; keep the display name current.
        if ($profileName !== null && $contact->profile_name !== $profileName) {
            $contact->forceFill(['profile_name' => $profileName])->save();
        }

        return $contact;
    }

    /**
     * Best-effort match of a WhatsApp number to a portal user.
     *
     * Compares digits only, since users store numbers in assorted formats
     * (+92 300…, 0300…, 0092300…). Matches on the last 10 digits — long enough
     * to be unique in practice, short enough to survive country-code omission.
     */
    private function matchPortalUser(string $waId): ?User
    {
        if (!$this->usersTableHasPhone()) {
            return null;
        }

        $tail = substr(preg_replace('/\D+/', '', $waId) ?? '', -10);

        if (strlen($tail) < 10) {
            return null;
        }

        return User::query()
            ->whereRaw("regexp_replace(coalesce(phone, ''), '\\D', '', 'g') LIKE ?", ['%'.$tail])
            ->first();
    }

    /** The users table only has a phone column on some deployments. */
    private function usersTableHasPhone(): bool
    {
        static $has = null;

        return $has ??= Schema::hasColumn('users', 'phone');
    }

    /**
     * Pull the human-readable text out of whichever payload shape arrived.
     *
     * @param  array<string, mixed>  $raw
     */
    private function extractBody(array $raw, WhatsAppMessageType $type): ?string
    {
        return match ($type) {
            WhatsAppMessageType::Text => $raw['text']['body'] ?? null,
            WhatsAppMessageType::Image,
            WhatsAppMessageType::Video,
            WhatsAppMessageType::Document => $raw[$type->value]['caption'] ?? null,
            WhatsAppMessageType::Location => trim(sprintf(
                '%s %s',
                $raw['location']['name'] ?? '',
                $raw['location']['address'] ?? '',
            )) ?: sprintf(
                '%s, %s',
                $raw['location']['latitude'] ?? '?',
                $raw['location']['longitude'] ?? '?',
            ),
            WhatsAppMessageType::Contacts => $this->extractContactNames($raw),
            // Meta's own explanation of why it could not deliver the content.
            WhatsAppMessageType::Unsupported => $raw['errors'][0]['title'] ?? null,
            default => null,
        };
    }

    /**
     * Join the formatted names from a shared-contact card.
     *
     * @param  array<string, mixed>  $raw
     */
    private function extractContactNames(array $raw): ?string
    {
        $cards = is_array($raw['contacts'] ?? null) ? $raw['contacts'] : [];
        $names = [];

        foreach ($cards as $card) {
            $name = $card['name']['formatted_name'] ?? null;

            if (is_string($name) && $name !== '') {
                $names[] = $name;
            }
        }

        return $names === [] ? null : implode(', ', $names);
    }

    /**
     * Copy inbound media onto the private disk.
     *
     * Meta expires its copy after 30 days; without mirroring, the audit trail
     * would develop holes exactly where evidence matters most.
     *
     * @param  array<string, mixed>  $raw
     */
    private function mirrorInboundMedia(WhatsAppMessage $message, array $raw, WhatsAppMessageType $type): void
    {
        $media = $raw[$type->value] ?? [];
        $mediaId = $media['id'] ?? null;

        if (!is_string($mediaId) || $mediaId === '') {
            return;
        }

        $message->forceFill(['media_id' => $mediaId])->save();

        try {
            $meta = $this->api->fetchMediaMetadata($mediaId);
            $max = (int) config('whatsapp.media.max_bytes', 104857600);

            if (($meta['file_size'] ?? 0) > $max) {
                Log::warning('WhatsApp inbound media exceeds max_bytes; metadata kept, file skipped.', [
                    'wamid' => $message->wamid,
                    'size' => $meta['file_size'],
                ]);

                return;
            }

            $bytes = $this->api->downloadMedia($meta['url']);
            $disk = (string) config('whatsapp.media.disk', 'local');
            $dir = trim((string) config('whatsapp.media.directory', 'whatsapp'), '/');
            $extension = $this->extensionFor($meta['mime_type'] ?? $media['mime_type'] ?? null);
            $path = "{$dir}/inbound/{$message->uuid}{$extension}";

            Storage::disk($disk)->put($path, $bytes);

            $message->forceFill([
                'disk' => $disk,
                'path' => $path,
                'original_name' => $media['filename'] ?? basename($path),
                'mime_type' => $meta['mime_type'] ?? $media['mime_type'] ?? null,
                'size' => strlen($bytes),
            ])->save();
        } catch (Throwable $e) {
            // The message row stays — only the binary is missing, and media_id
            // is recorded so it can be re-fetched within Meta's 30-day window.
            Log::error('WhatsApp media mirroring failed.', [
                'wamid' => $message->wamid,
                'media_id' => $mediaId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Map a MIME type to a file extension for the stored copy. */
    private function extensionFor(?string $mime): string
    {
        if ($mime === null) {
            return '';
        }

        // Meta appends codec params, e.g. "audio/ogg; codecs=opus".
        $mime = trim(explode(';', $mime)[0]);

        return match ($mime) {
            'image/jpeg' => '.jpg',
            'image/png' => '.png',
            'image/webp' => '.webp',
            'video/mp4' => '.mp4',
            'audio/ogg' => '.ogg',
            'audio/mpeg' => '.mp3',
            'audio/mp4' => '.m4a',
            'application/pdf' => '.pdf',
            default => '',
        };
    }

    /**
     * Index the `contacts` array by wa_id so profile names can be looked up.
     *
     * @param  array<int, array<string, mixed>>  $contacts
     * @return array<string, string>
     */
    private function indexProfiles(array $contacts): array
    {
        $out = [];

        foreach ($contacts as $contact) {
            $waId = $contact['wa_id'] ?? null;
            $name = $contact['profile']['name'] ?? null;

            if (is_string($waId) && is_string($name)) {
                $out[$waId] = $name;
            }
        }

        return $out;
    }
}
