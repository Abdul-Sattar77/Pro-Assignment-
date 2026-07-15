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
])]
class Assignment extends Model
{
    use HasUuid;
    use SoftDeletes;

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
}
