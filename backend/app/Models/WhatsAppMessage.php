<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WhatsAppDirection;
use App\Enums\WhatsAppMessageStatus;
use App\Enums\WhatsAppMessageType;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * A single WhatsApp message, inbound or outbound.
 *
 * Never hard-deleted: `SoftDeletes` plus `deleted_by` means a rep hiding a
 * message from the inbox still leaves the full record — and who hid it — for
 * the admin audit view. Activity logging records the delete event itself.
 *
 * @property WhatsAppDirection $direction
 * @property WhatsAppMessageType $type
 * @property WhatsAppMessageStatus $status
 * @property string|null $wamid
 * @property string|null $body
 * @property array<string, mixed>|null $payload
 * @property int|null $sender_id
 * @property int|null $deleted_by
 * @property bool $is_template
 * @property bool $via_business_app
 * @property Carbon|null $edited_at
 * @property string|null $error_code
 * @property string|null $error_message
 * @property Carbon|null $sent_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $read_at
 * @property Carbon|null $failed_at
 */
#[Fillable([
    'contact_id', 'wamid', 'context_wamid', 'direction', 'type', 'body',
    'sender_id', 'status', 'error_code', 'error_message',
    'sent_at', 'delivered_at', 'read_at', 'failed_at',
    'is_template', 'template_name', 'via_business_app', 'edited_at',
    'media_id', 'disk', 'path', 'original_name', 'mime_type', 'size', 'payload',
])]
class WhatsAppMessage extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'whatsapp_messages';

    protected function casts(): array
    {
        return [
            'direction' => WhatsAppDirection::class,
            'type' => WhatsAppMessageType::class,
            'status' => WhatsAppMessageStatus::class,
            'is_template' => 'boolean',
            'via_business_app' => 'boolean',
            'size' => 'integer',
            'payload' => 'array',
            'edited_at' => 'datetime',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    /**
     * Audit trail configuration (spatie/activitylog).
     *
     * `payload` is deliberately excluded — it is bulky and already stored on
     * the row itself; the log captures who did what, not a second copy.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'contact_id', 'wamid', 'direction', 'type', 'body',
                'sender_id', 'status', 'deleted_by', 'original_name',
                'via_business_app',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('whatsapp_message');
    }

    /** @return BelongsTo<WhatsAppContact, $this> */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'contact_id');
    }

    /**
     * The sales rep who sent this message. Null for inbound messages (the
     * customer sent those) — this is the "which rep replied" attribution the
     * admin oversight view is built on.
     *
     * @return BelongsTo<User, $this>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Who hid this message from the inbox, if anyone.
     *
     * @return BelongsTo<User, $this>
     */
    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    public function isInbound(): bool
    {
        return $this->direction === WhatsAppDirection::Inbound;
    }

    /**
     * Advance the delivery status, ignoring regressions.
     *
     * Meta does not guarantee status-callback ordering, so a late `sent`
     * webhook must not overwrite an already-recorded `read`.
     */
    public function advanceStatus(WhatsAppMessageStatus $next, ?Carbon $at = null): bool
    {
        if ($next->rank() <= $this->status->rank()) {
            return false;
        }

        $at ??= now();

        $this->status = $next;

        match ($next) {
            WhatsAppMessageStatus::Sent => $this->sent_at ??= $at,
            WhatsAppMessageStatus::Delivered => $this->delivered_at ??= $at,
            WhatsAppMessageStatus::Read => $this->read_at ??= $at,
            WhatsAppMessageStatus::Failed => $this->failed_at ??= $at,
            WhatsAppMessageStatus::Pending => null,
        };

        $this->save();

        return true;
    }
}
