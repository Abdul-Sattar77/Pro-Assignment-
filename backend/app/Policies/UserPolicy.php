<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

/**
 * Fine-grained authorization for user management. Level 2 of the RBAC model —
 * permission slugs are data-driven (never hardcoded role names here).
 */
final class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('users.view');
    }

    public function view(User $actor, User $user): bool
    {
        return $actor->can('users.view') || $actor->is($user);
    }

    public function create(User $actor): bool
    {
        return $actor->can('users.create');
    }

    public function update(User $actor, User $user): bool
    {
        return $actor->can('users.update');
    }

    public function delete(User $actor, User $user): bool
    {
        return $actor->can('users.delete');
    }
}
