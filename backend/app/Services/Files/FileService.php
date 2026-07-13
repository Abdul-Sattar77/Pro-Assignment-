<?php

declare(strict_types=1);

namespace App\Services\Files;

use App\Models\File;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class FileService
{
    public function __construct(
        private readonly FileRepositoryInterface $files,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    /**
     * Store an uploaded file.
     *
     * @param  array{assignmentId?: string|null}  $data
     */
    public function store(User $uploader, UploadedFile $uploadedFile, array $data): File
    {
        return DB::transaction(function () use ($uploader, $uploadedFile, $data): File {
            $assignmentId = null;
            if (is_string($data['assignmentId'] ?? null) && $data['assignmentId'] !== '') {
                $assignment = $this->assignments->findByUuid($data['assignmentId']);
                $assignmentId = $assignment?->getKey();
            }

            $originalName = $uploadedFile->getClientOriginalName();
            $mimeType = $uploadedFile->getClientMimeType() ?? $uploadedFile->getMimeType() ?? 'application/octet-stream';
            $size = $uploadedFile->getSize();

            // Duplicate Handling: If file already exists with same original name for this assignment
            $existingCount = File::query()
                ->where('original_name', $originalName)
                ->where('assignment_id', $assignmentId)
                ->count();

            if ($existingCount > 0) {
                // Suffix the name e.g. "report (1).pdf"
                $pathInfo = pathinfo($originalName);
                $ext = isset($pathInfo['extension']) ? '.' . $pathInfo['extension'] : '';
                $base = $pathInfo['filename'] ?? 'file';
                $originalName = "{$base} ({$existingCount}){$ext}";
            }

            // Generate unique name on disk to prevent collisions
            $diskName = Str::uuid()->toString() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
            $extension = $uploadedFile->getClientOriginalExtension();
            if ($extension !== '') {
                $diskName .= '.' . $extension;
            }

            // Save to physical disk under files/ directory
            $disk = 'local';
            $path = $uploadedFile->storeAs('files', $diskName, $disk);

            if ($path === false) {
                throw new \RuntimeException('Failed to write uploaded file to storage disk.');
            }

            return $this->files->create([
                'filename' => $diskName,
                'original_name' => $originalName,
                'disk' => $disk,
                'path' => $path,
                'mime_type' => $mimeType,
                'size' => $size,
                'uploaded_by' => $uploader->getKey(),
                'assignment_id' => $assignmentId,
            ]);
        });
    }

    /**
     * Rename a file.
     */
    public function rename(File $file, string $newName): File
    {
        return DB::transaction(function () use ($file, $newName): File {
            // Retain original extension if not provided in new name
            $oldExt = pathinfo($file->original_name, PATHINFO_EXTENSION);
            $newExt = pathinfo($newName, PATHINFO_EXTENSION);

            if ($oldExt !== '' && $newExt === '') {
                $newName .= '.' . $oldExt;
            }

            return $this->files->update($file, [
                'original_name' => $newName,
            ]);
        });
    }

    /**
     * Delete a file resource.
     */
    public function delete(File $file): bool
    {
        return DB::transaction(function () use ($file): bool {
            // Delete from disk first
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }

            return $this->files->delete($file);
        });
    }
}
