<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string $title
 * @property string|null $description
 * @property CalendarEventType $event_type
 * @property Carbon $start_date
 * @property Carbon|null $end_date
 * @property int|null $assignment_id
 * @property int|null $task_id
 * @property int|null $user_id
 * @property int $created_by_id
 * @property CalendarEventStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'description', 'event_type', 'start_date', 'end_date', 'assignment_id', 'task_id', 'user_id', 'created_by_id', 'status'])]
class CalendarEvent extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'event_type' => CalendarEventType::class,
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'status' => CalendarEventStatus::class,
        ];
    }

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /** @return BelongsTo<Task, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /** Audit trail logging. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'event_type', 'start_date', 'end_date', 'user_id', 'status'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('calendar_event');
    }
}
