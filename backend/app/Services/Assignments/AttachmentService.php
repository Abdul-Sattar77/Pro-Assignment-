<?php

declare(strict_types=1);

namespace App\Services\Assignments;

use App\Enums\AssignmentEventType;
use App\Models\Assignment;
use App\Models\AssignmentAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Manages file and voice-note attachments for assignments.
 * All files are stored on the configured disk (local by default).
 */
final class AttachmentService
{
    /**
     * Store an uploaded file and record a timeline event.
     *
     * @param  'file'|'voice_note'  $type
     */
    public function upload(
        User $actor,
        Assignment $assignment,
        UploadedFile $file,
        string $type,
    ): AssignmentAttachment {
        return DB::transaction(function () use ($actor, $assignment, $file, $type): AssignmentAttachment {
            $disk = config('filesystems.default', 'local');
            $path = $file->store("assignments/{$assignment->uuid}/{$type}s", $disk);

            /** @var AssignmentAttachment $attachment */
            $attachment = $assignment->attachments()->create([
                'uploaded_by'   => $actor->getKey(),
                'type'          => $type,
                'disk'          => $disk,
                'path'          => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
            ]);

            $attachment->load('uploader', 'assignment');

            $assignment->events()->create([
                'actor_id' => $actor->getKey(),
                'type'     => AssignmentEventType::AttachmentAdded,
                'note'     => $file->getClientOriginalName(),
            ]);

            return $attachment;
        });
    }

    /**
     * Soft-delete the attachment and remove the stored file.
     */
    public function delete(User $actor, AssignmentAttachment $attachment): void
    {
        DB::transaction(function () use ($attachment): void {
            Storage::disk($attachment->disk)->delete($attachment->path);
            $attachment->delete();
        });
    }

    /**
     * Stream the file as a download response.
     */
    public function download(AssignmentAttachment $attachment): StreamedResponse
    {
        return Storage::disk($attachment->disk)->download(
            $attachment->path,
            $attachment->original_name ?? basename($attachment->path),
        );
    }
}
