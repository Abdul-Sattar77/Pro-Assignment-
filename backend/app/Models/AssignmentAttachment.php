<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * @property string      $type          'file' | 'voice_note'
 * @property string      $disk
 * @property string      $path
 * @property string|null $original_name
 * @property string|null $mime_type
 * @property int|null    $size          bytes
 */
#[Fillable(['assignment_id', 'uploaded_by', 'type', 'disk', 'path', 'original_name', 'mime_type', 'size'])]
class AssignmentAttachment extends Model
{
    use HasUuid;
    use SoftDeletes;

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /** @return BelongsTo<User, $this> */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Download URL for this attachment.
     * Served via the authenticated download route — passes UUID so the route-model
     * binding (HasUuid::getRouteKeyName = 'uuid') resolves correctly.
     */
    public function getUrlAttribute(): string
    {
        /** @var Assignment $assignment */
        $assignment = $this->relationLoaded('assignment')
            ? $this->assignment
            : $this->assignment()->first();

        return route('assignments.attachments.download', [
            'assignment' => $assignment->uuid,
            'attachment' => $this->uuid,
        ]);
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
}
