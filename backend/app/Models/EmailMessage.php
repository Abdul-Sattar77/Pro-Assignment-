<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EmailDirection;
use App\Enums\EmailMessageStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * A single email, inbound or outbound.
 *
 * Never hard-deleted: `SoftDeletes` plus `deleted_by` means a rep hiding a
 * message from the inbox still leaves the full record for the admin audit
 * view — the same guarantee the WhatsApp inbox gives.
 *
 * @property EmailDirection $direction
 * @property EmailMessageStatus $status
 * @property string|null $gmail_message_id
 * @property string|null $rfc_message_id
 * @property string|null $in_reply_to
 * @property string|null $references
 * @property string|null $body_text
 * @property string|null $body_html
 * @property array<int, array{email: string, name: string|null}>|null $to
 * @property array<int, array{email: string, name: string|null}>|null $cc
 * @property array<string, mixed>|null $payload
 * @property int|null $sender_id
 * @property int|null $deleted_by
 * @property bool $via_mail_client
 * @property bool $is_read
 * @property Carbon|null $sent_at
 */
#[Fillable([
    'thread_id', 'gmail_message_id', 'rfc_message_id', 'in_reply_to', 'references',
    'direction', 'from_email', 'from_name', 'to', 'cc', 'bcc',
    'subject', 'snippet', 'body_text', 'body_html',
    'sender_id', 'via_mail_client', 'status', 'error_message',
    'is_read', 'sent_at', 'payload',
])]
class EmailMessage extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'email_messages';

    protected function casts(): array
    {
        return [
            'direction' => EmailDirection::class,
            'status' => EmailMessageStatus::class,
            'to' => 'array',
            'cc' => 'array',
            'bcc' => 'array',
            'payload' => 'array',
            'via_mail_client' => 'boolean',
            'is_read' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    /**
     * Audit trail configuration (spatie/activitylog).
     *
     * Bodies are excluded — they are already on the row and would double the
     * log's size; the log records who did what.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'thread_id', 'gmail_message_id', 'direction', 'subject',
                'from_email', 'sender_id', 'status', 'deleted_by', 'via_mail_client',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('email_message');
    }

    /** @return BelongsTo<EmailThread, $this> */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(EmailThread::class, 'thread_id');
    }

    /**
     * The sales rep who sent this. Null for inbound, and for mail sent
     * straight from Gmail rather than the portal.
     *
     * @return BelongsTo<User, $this>
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /** @return BelongsTo<User, $this> */
    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    /** @return HasMany<EmailAttachment, $this> */
    public function attachments(): HasMany
    {
        return $this->hasMany(EmailAttachment::class, 'message_id');
    }

    public function isInbound(): bool
    {
        return $this->direction === EmailDirection::Inbound;
    }
}
