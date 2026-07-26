<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AcademicLevel;
use App\Enums\AssignmentPriority;
use App\Enums\AssignmentStatus;
use App\Enums\AssignmentType;
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
 * @property AssignmentStatus $status
 * @property ?AssignmentType $type
 * @property ?AcademicLevel $academic_level
 * @property AssignmentPriority $priority
 * @property ?int $word_count
 * @property Carbon $deadline
 */
#[Fillable([
    'title', 'subject', 'type', 'academic_level', 'course', 'university',
    'word_count', 'referencing_style', 'priority', 'contact_phone',
    'contact_whatsapp', 'description', 'deadline', 'status', 'client_id',
    'project_manager_id', 'writer_id',
    'client_price', 'writer_cost', 'additional_costs', 'discount', 'net_profit',
])]
class Assignment extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Assignment $assignment) {
            $assignment->net_profit = ((float) ($assignment->client_price ?? 0.0))
                - ((float) ($assignment->discount ?? 0.0))
                - ((float) ($assignment->writer_cost ?? 0.0))
                - ((float) ($assignment->additional_costs ?? 0.0));
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'client_id', 'writer_id', 'project_manager_id', 'client_price', 'writer_cost', 'additional_costs', 'discount', 'net_profit', 'deadline'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('assignment');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'status' => AssignmentStatus::class,
            'type' => AssignmentType::class,
            'academic_level' => AcademicLevel::class,
            'priority' => AssignmentPriority::class,
            'word_count' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /** @return BelongsTo<User, $this> */
    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /** @return BelongsTo<User, $this> */
    public function writer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'writer_id');
    }

    /** @return HasMany<AssignmentEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(AssignmentEvent::class)->latest('id');
    }

    /** @return HasMany<File, $this> */
    public function files(): HasMany
    {
        return $this->hasMany(File::class)->latest('id');
    }

    /** @return HasMany<Message, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->oldest('id');
    }

    /** Admin-panel attachments & voice notes (separate from per-order files). */
    /** @return HasMany<AssignmentAttachment, $this> */
    public function attachments(): HasMany
    {
        return $this->hasMany(AssignmentAttachment::class)->latest('id');
    }

    /** @return HasMany<Invoice, $this> */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
