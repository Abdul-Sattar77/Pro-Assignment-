<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\User;

/**
 * Coarse authorization for assignments: who may see/touch this order at all.
 * Fine state rules (who may act WHEN) live in AssignmentService.
 */
final class AssignmentPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('assignments.view');
    }

    public function view(User $actor, Assignment $assignment): bool
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return $actor->can('assignments.view');
        }

        return $actor->getKey() === $assignment->client_id
            || ($assignment->writer_id !== null && $actor->getKey() === $assignment->writer_id);
    }

    public function create(User $actor): bool
    {
        return $actor->can('assignments.create');
    }

    public function assign(User $actor, Assignment $assignment): bool
    {
        return $actor->hasRole(Role::ProjectManager->value) && $actor->can('assignments.assign');
    }

    public function assignManager(User $actor, Assignment $assignment): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value);
    }

    public function submit(User $actor, Assignment $assignment): bool
    {
        return $actor->can('assignments.submit');
    }

    public function review(User $actor, Assignment $assignment): bool
    {
        return $actor->can('assignments.review');
    }

    public function requestRevision(User $actor, Assignment $assignment): bool
    {
        return $actor->can('assignments.request_revision');
    }

    public function complete(User $actor, Assignment $assignment): bool
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return true;
        }

        return $actor->can('assignments.complete');
    }

    /** Cancel window rules are enforced in the service. */
    public function cancel(User $actor, Assignment $assignment): bool
    {
        return $this->view($actor, $assignment);
    }

    /** Admin and PM may edit assignment fields (priority, notes, etc.). */
    public function update(User $actor, Assignment $assignment): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value);
    }

    /** Admin, PM, the assigned writer, or the owner client may upload files / voice notes to an assignment. */
    public function uploadAttachment(User $actor, Assignment $assignment): bool
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return true;
        }

        if ($actor->hasRole(Role::Writer->value) && $assignment->writer_id === $actor->getKey()) {
            return true;
        }

        if ($actor->hasRole(Role::Client->value) && $assignment->client_id === $actor->getKey()) {
            return true;
        }

        return false;
    }

    /** Only admin may delete attachments. */
    public function deleteAttachment(User $actor, Assignment $assignment): bool
    {
        return $actor->hasRole(Role::Admin->value);
    }
}
