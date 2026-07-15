<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string            $title
 * @property string|null       $description
 * @property int|null          $assignment_id
 * @property int|null          $assigned_user_id
 * @property int               $created_by_id
 * @property TaskPriority      $priority
 * @property TaskStatus        $status
 * @property Carbon|null       $due_date
 * @property Carbon|null       $completed_at
 * @property string|null       $notes
 * @property Carbon|null       $created_at
 * @property Carbon|null       $updated_at
 */
#[Fillable(['title', 'description', 'assignment_id', 'assigned_user_id', 'created_by_id', 'priority', 'status', 'due_date', 'completed_at', 'notes'])]
class Task extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'priority' => TaskPriority::class,
            'due_date' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /** @return BelongsTo<User, $this> */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /** Audit trail configuration (spatie/activitylog). */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'assigned_user_id', 'priority', 'status', 'due_date', 'notes'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('task');
    }
}
