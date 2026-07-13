<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string      $filename
 * @property string      $original_name
 * @property string      $disk
 * @property string      $path
 * @property string      $mime_type
 * @property int         $size
 * @property int|null    $uploaded_by
 * @property int|null    $assignment_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['filename', 'original_name', 'disk', 'path', 'mime_type', 'size', 'uploaded_by', 'assignment_id'])]
class File extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** Human-readable file size (e.g. "1.2 MB"). */
    public function getHumanSizeAttribute(): string
    {
        $bytes = $this->size ?? 0;

        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        if ($bytes < 1073741824) return round($bytes / 1048576, 1) . ' MB';
        return round($bytes / 1073741824, 1) . ' GB';
    }

    /** Download URL for this file resource. */
    public function getDownloadUrlAttribute(): string
    {
        return route('files.download', [
            'file' => $this->uuid,
        ]);
    }

    /** Audit trail logging (spatie/activitylog). */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['filename', 'original_name', 'mime_type', 'size', 'assignment_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('file');
    }
}
