<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\Role;
use App\Models\File;
use App\Models\User;
use App\Repositories\Contracts\FileRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

final class FileRepository extends BaseRepository implements FileRepositoryInterface
{
    public function __construct(File $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?File
    {
        return File::query()->find($id);
    }

    public function findByUuid(string $uuid): ?File
    {
        return File::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): File
    {
        return File::query()->create($data);
    }

    public function getFilteredFor(User $actor, array $filters): Collection
    {
        $query = File::query()->with(['assignment', 'uploader']);

        // ---- RBAC Access Scoping ----
        $isAdmin = $actor->hasRole(Role::Admin->value);

        if (!$isAdmin) {
            if ($actor->hasRole(Role::ProjectManager->value)) {
                $query->where(function ($q) use ($actor): void {
                    $q->where('uploaded_by', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('project_manager_id', $actor->getKey());
                        });
                });
            } elseif ($actor->hasRole(Role::Writer->value)) {
                $query->where(function ($q) use ($actor): void {
                    $q->where('uploaded_by', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('writer_id', $actor->getKey());
                        });
                });
            } elseif ($actor->hasRole(Role::Client->value)) {
                $query->where(function ($q) use ($actor): void {
                    $q->where('uploaded_by', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('client_id', $actor->getKey());
                        });
                });
            } else {
                // Deny access to other roles by default
                $query->whereRaw('1 = 0');
            }
        }

        // ---- Filtering ----
        $assignmentId = $filters['assignment_id'] ?? null;
        if ($assignmentId !== null) {
            $query->where('assignment_id', $assignmentId);
        }

        $uploadedBy = $filters['uploaded_by'] ?? null;
        if ($uploadedBy !== null) {
            $query->where('uploaded_by', $uploadedBy);
        }

        $typeGroup = $filters['type'] ?? null;
        if (is_string($typeGroup) && $typeGroup !== '') {
            if ($typeGroup === 'document') {
                $query->where(function ($q): void {
                    $q->where('mime_type', 'like', 'application/%')
                      ->orWhere('mime_type', 'like', 'text/%');
                });
            } elseif ($typeGroup === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($typeGroup === 'archive') {
                $query->where(function ($q): void {
                    $q->where('mime_type', 'like', '%zip%')
                      ->orWhere('mime_type', 'like', '%rar%')
                      ->orWhere('mime_type', 'like', '%tar%');
                });
            }
        }

        // ---- Search ----
        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('original_name', 'ilike', '%' . $search . '%')
                  ->orWhere('filename', 'ilike', '%' . $search . '%');
            });
        }

        // ---- Sorting ----
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $allowedSorts = ['created_at', 'original_name', 'size'];
        if (!in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'created_at';
        }

        if (!in_array(strtolower($sortOrder), ['asc', 'desc'], true)) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        return $query->get();
    }
}
