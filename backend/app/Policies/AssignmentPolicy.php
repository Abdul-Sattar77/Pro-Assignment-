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
        return $actor->can('assignments.assign');
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

    /** Cancel window rules are enforced in the service. */
    public function cancel(User $actor, Assignment $assignment): bool
    {
        return $this->view($actor, $assignment);
    }
}
