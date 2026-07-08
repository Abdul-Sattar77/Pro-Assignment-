<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\File;
use App\Models\User;

/**
 * Authorization for files. Visibility follows the parent assignment; deletion
 * is limited to the uploader or an admin.
 */
final class FilePolicy
{
    public function view(User $actor, File $file): bool
    {
        $assignment = $file->assignment;

        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return $actor->can('files.view');
        }

        return $actor->getKey() === $assignment->client_id
            || ($assignment->writer_id !== null && $actor->getKey() === $assignment->writer_id);
    }

    public function delete(User $actor, File $file): bool
    {
        return $actor->hasRole(Role::Admin->value)
            || $actor->getKey() === $file->uploader_id;
    }
}
