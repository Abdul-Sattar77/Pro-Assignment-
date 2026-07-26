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
                    $q->where('uploader_id', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('project_manager_id', $actor->getKey());
                        });
                });
            } elseif ($actor->hasRole(Role::Writer->value)) {
                $query->where(function ($q) use ($actor): void {
                    $q->where('uploader_id', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('writer_id', $actor->getKey());
                        });
                });
            } elseif ($actor->hasRole(Role::Client->value)) {
                $query->where(function ($q) use ($actor): void {
                    $q->where('uploader_id', $actor->getKey())
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

        $uploaderId = $filters['uploader_id'] ?? $filters['uploaded_by'] ?? null;
        if ($uploaderId !== null) {
            $query->where('uploader_id', $uploaderId);
        }

        $typeGroup = $filters['type'] ?? null;
        if (is_string($typeGroup) && $typeGroup !== '') {
            if ($typeGroup === 'document') {
                $query->where(function ($q): void {
                    $q->where('mime', 'like', 'application/%')
                        ->orWhere('mime', 'like', 'text/%');
                });
            } elseif ($typeGroup === 'image') {
                $query->where('mime', 'like', 'image/%');
            } elseif ($typeGroup === 'archive') {
                $query->where(function ($q): void {
                    $q->where('mime', 'like', '%zip%')
                        ->orWhere('mime', 'like', '%rar%')
                        ->orWhere('mime', 'like', '%tar%');
                });
            }
        }

        // ---- Search ----
        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('original_name', 'like', '%'.$search.'%')
                    ->orWhereHas('assignment', function ($aq) use ($search): void {
                        $aq->where('title', 'like', '%'.$search.'%');
                    });
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
