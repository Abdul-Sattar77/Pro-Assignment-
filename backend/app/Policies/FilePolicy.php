<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\File;
use App\Models\User;

final class FilePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('files.view') || $actor->hasRole(Role::Admin->value);
    }

    public function view(User $actor, File $file): bool
    {
        if ($actor->hasRole(Role::Admin->value)) {
            return true;
        }

        // Uploader can always view
        if ($file->uploaded_by === $actor->getKey()) {
            return true;
        }

        // Otherwise check assignment linkage
        $assignment = $file->assignment;
        if ($assignment === null) {
            return false;
        }

        if ($actor->hasRole(Role::ProjectManager->value)) {
            return $assignment->project_manager_id === $actor->getKey();
        }

        if ($actor->hasRole(Role::Writer->value)) {
            return $assignment->writer_id === $actor->getKey();
        }

        if ($actor->hasRole(Role::Client->value)) {
            return $assignment->client_id === $actor->getKey();
        }

        return false;
    }

    public function create(User $actor): bool
    {
        return $actor->can('files.upload') || $actor->hasRole(Role::Admin->value);
    }

    public function update(User $actor, File $file): bool
    {
        if ($actor->hasRole(Role::Admin->value)) {
            return true;
        }

        // Only uploader or PM of the linked assignment can rename
        if ($file->uploaded_by === $actor->getKey()) {
            return true;
        }

        $assignment = $file->assignment;
        if ($assignment !== null && $actor->hasRole(Role::ProjectManager->value)) {
            return $assignment->project_manager_id === $actor->getKey();
        }

        return false;
    }

    public function delete(User $actor, File $file): bool
    {
        if ($actor->hasRole(Role::Admin->value)) {
            return true;
        }

        // Only uploader or PM of the linked assignment can delete
        if ($file->uploaded_by === $actor->getKey()) {
            return true;
        }

        $assignment = $file->assignment;
        if ($assignment !== null && $actor->hasRole(Role::ProjectManager->value)) {
            return $assignment->project_manager_id === $actor->getKey();
        }

        return false;
    }
}
