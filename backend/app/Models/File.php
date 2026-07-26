<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\FileCategory;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property FileCategory $category
 * @property int $size
 */
#[Fillable(['assignment_id', 'uploader_id', 'category', 'original_name', 'note', 'notes', 'version', 'disk', 'path', 'mime', 'size'])]
class File extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => FileCategory::class,
            'size' => 'integer',
            'version' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['original_name', 'category', 'notes', 'version', 'assignment_id', 'uploader_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('file');
    }

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
