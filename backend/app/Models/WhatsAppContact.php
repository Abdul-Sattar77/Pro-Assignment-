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
 * A customer's WhatsApp number, which *is* the conversation thread — WhatsApp
 * has no notion of multiple threads with one number.
 *
 * @property int $id
 * @property string $uuid
 * @property string $wa_id
 * @property string|null $phone
 * @property string|null $profile_name
 * @property int|null $user_id
 * @property int|null $lead_id
 * @property int|null $assigned_to
 * @property bool $is_archived
 * @property int|null $archived_by
 * @property Carbon|null $archived_at
 * @property Carbon|null $last_message_at
 * @property Carbon|null $last_inbound_at
 */
#[Fillable([
    'wa_id', 'phone', 'profile_name', 'user_id', 'lead_id',
    'assigned_to', 'last_message_at', 'last_inbound_at',
    'is_archived', 'archived_by', 'archived_at',
])]
class WhatsAppContact extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected $table = 'whatsapp_contacts';

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'last_inbound_at' => 'datetime',
            'archived_at' => 'datetime',
            'is_archived' => 'boolean',
        ];
    }

    /** Audit trail: assignment and archive changes are the sensitive ones. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['wa_id', 'profile_name', 'assigned_to', 'user_id', 'lead_id', 'is_archived'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('whatsapp_contact');
    }

    /** @return HasMany<WhatsAppMessage, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'contact_id')->oldest('id');
    }

    /** @return HasOne<WhatsAppMessage, $this> */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(WhatsAppMessage::class, 'contact_id')->latestOfMany();
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

    /**
     * The portal user this number belongs to, once matched.
     *
     * @return BelongsTo<User, $this>
     */
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
        return $this->belongsToMany(User::class, 'whatsapp_contact_reads', 'contact_id', 'user_id')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    /**
     * Is the free-of-charge 24-hour customer service window still open?
     *
     * Meta only accepts free-form replies within this window; outside it a
     * (billable) approved template is the sole delivery path.
     */
    public function isWithinServiceWindow(): bool
    {
        if ($this->last_inbound_at === null) {
            return false;
        }

        $hours = (int) config('whatsapp.service_window_hours', 24);

        return $this->last_inbound_at->addHours($hours)->isFuture();
    }

    /** When the free reply window closes, or null if it is already shut. */
    public function serviceWindowExpiresAt(): ?Carbon
    {
        if (!$this->isWithinServiceWindow()) {
            return null;
        }

        return $this->last_inbound_at?->addHours((int) config('whatsapp.service_window_hours', 24));
    }

    /**
     * Threads a given rep may act on: their own, or the unassigned queue.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->can('whatsapp.audit')) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user): void {
            $q->where('assigned_to', $user->getKey())->orWhereNull('assigned_to');
        });
    }
}
