<?php

declare(strict_types=1);

namespace App\Services\Files;

use App\Enums\FileCategory;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\File as FileModel;
use App\Models\User;
use App\Repositories\Contracts\FileRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Owns ALL file behavior so business modules never touch storage directly.
 */
final class FileService
{
    public function __construct(
        private readonly FileRepositoryInterface $fileRepo,
    ) {}

    public function listAll(User $actor, array $filters = []): Collection
    {
        return $this->fileRepo->getFilteredFor($actor, $filters);
    }

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
     * Store an uploaded file against an assignment.
     */
    public function upload(Assignment $assignment, User $uploader, UploadedFile $file, ?string $note = null): FileModel
    {
        $disk = $this->disk();
        $path = $file->store($this->directory($assignment), $disk);

        $data = $this->filterExistingColumns([
            'uploader_id' => $uploader->getKey(),
            'category' => $this->categoryFor($uploader, $assignment)->value,
            'original_name' => $file->getClientOriginalName(),
            'note' => $note,
            'notes' => $note,
            'version' => 1,
            'disk' => $disk,
            'path' => (string) $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
        ]);

        return $assignment->files()->create($data);
    }

    /** Store a standalone file (e.g. template document, general attachment). */
    public function uploadGeneral(User $uploader, UploadedFile $file): FileModel
    {
        $disk = $this->disk();
        $path = $file->store('general', $disk);

        $data = $this->filterExistingColumns([
            'assignment_id' => null,
            'uploader_id' => $uploader->getKey(),
            'category' => FileCategory::General->value,
            'original_name' => $file->getClientOriginalName(),
            'version' => 1,
            'disk' => $disk,
            'path' => (string) $path,
            'mime' => $file->getClientMimeType(),
            'size' => $file->getSize() ?: 0,
        ]);

        return FileModel::create($data);
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

    /** Safely strip attributes if table column has not been migrated yet. */
    private function filterExistingColumns(array $data): array
    {
        if (!Schema::hasColumn('files', 'version')) {
            unset($data['version']);
        }
        if (!Schema::hasColumn('files', 'notes')) {
            unset($data['notes']);
        }
        if (!Schema::hasColumn('files', 'note')) {
            unset($data['note']);
        }

        return $data;
    }
}
