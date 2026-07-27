<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * One email conversation, keyed by Gmail's own thread id.
 *
 * @property int $id
 * @property string $uuid
 * @property string $gmail_thread_id
 * @property string|null $subject
 * @property string|null $contact_email
 * @property string|null $contact_name
 * @property int|null $user_id
 * @property int|null $lead_id
 * @property int|null $assigned_to
 * @property int $message_count
 * @property bool $is_archived
 * @property int|null $archived_by
 * @property Carbon|null $archived_at
 * @property Carbon|null $last_message_at
 * @property Carbon|null $last_inbound_at
 */
#[Fillable([
    'gmail_thread_id', 'subject', 'contact_email', 'contact_name',
    'user_id', 'lead_id', 'assigned_to', 'message_count',
    'last_message_at', 'last_inbound_at',
    'is_archived', 'archived_by', 'archived_at',
])]
class EmailThread extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'email_threads';

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'last_inbound_at' => 'datetime',
            'archived_at' => 'datetime',
            'is_archived' => 'boolean',
            'message_count' => 'integer',
        ];
    }

    /** Audit trail: assignment and archive changes are the sensitive ones. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['subject', 'contact_email', 'assigned_to', 'user_id', 'lead_id', 'is_archived'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('email_thread');
    }

    /** @return HasMany<EmailMessage, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(EmailMessage::class, 'thread_id')->oldest('id');
    }

    /** @return HasOne<EmailMessage, $this> */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(EmailMessage::class, 'thread_id')->latestOfMany();
    }

    /**
     * The sales rep who owns this thread, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return BelongsTo<Lead, $this> */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    /**
     * Per-user read state for the shared inbox.
     *
     * @return BelongsToMany<User, $this>
     */
    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'email_thread_reads', 'thread_id', 'user_id')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    /**
     * Threads a given rep may act on: their own, or the unassigned queue.
     * Unlike WhatsApp there is no billing window here — email has no
     * equivalent of Meta's 24-hour rule.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->can('email.audit')) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user): void {
            $q->where('assigned_to', $user->getKey())->orWhereNull('assigned_to');
        });
    }
}
