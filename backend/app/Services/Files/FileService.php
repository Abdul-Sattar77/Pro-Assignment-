<?php

declare(strict_types=1);

namespace App\Services\Files;

use App\Enums\FileCategory;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\File as FileModel;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Owns ALL file behavior so business modules never touch storage directly
 * (docs/architecture §9). Storage is provider-independent via the configured
 * disk — swap local → S3/R2/Spaces with no code change here.
 */
final class FileService
{
    /** Files live under a per-assignment namespace on the disk. */
    private function directory(Assignment $assignment): string
    {
        return "assignments/{$assignment->uuid}";
    }

    /** The disk to store on (env-driven: local in dev, S3-compatible in prod). */
    private function disk(): string
    {
        /** @var string $disk */
        $disk = config('filesystems.default', 'local');

        return $disk;
    }

    /**
     * Store an uploaded file against an assignment. Category is inferred from
     * the uploader's role: client → brief, writer → submission, staff →
     * general.
     */
    public function upload(Assignment $assignment, User $uploader, UploadedFile $file): FileModel
    {
        $disk = $this->disk();
        $path = $file->store($this->directory($assignment), $disk);

        return $assignment->files()->create([
            'uploader_id' => $uploader->getKey(),
            'category' => $this->categoryFor($uploader, $assignment)->value,
            'original_name' => $file->getClientOriginalName(),
            'disk' => $disk,
            'path' => (string) $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
        ]);
    }

    /** Store a standalone file (e.g. template document, general attachment). */
    public function uploadGeneral(User $uploader, UploadedFile $file): FileModel
    {
        $disk = $this->disk();
        $path = $file->store('general', $disk);

        return FileModel::create([
            'assignment_id' => null,
            'uploader_id' => $uploader->getKey(),
            'category' => FileCategory::General->value,
            'original_name' => $file->getClientOriginalName(),
            'disk' => $disk,
            'path' => (string) $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
        ]);
    }

    /** Permanently remove the stored object and soft-delete the record. */
    public function delete(FileModel $file): void
    {
        Storage::disk($file->disk)->delete($file->path);
        $file->delete();
    }

    /** Absolute-ish streaming response for an authorized download. */
    public function download(FileModel $file): StreamedResponse
    {
        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    private function categoryFor(User $uploader, Assignment $assignment): FileCategory
    {
        if ($uploader->getKey() === $assignment->client_id) {
            return FileCategory::Brief;
        }

        if ($uploader->hasRole(Role::Writer->value)) {
            return FileCategory::Submission;
        }

        return FileCategory::General;
    }
}
