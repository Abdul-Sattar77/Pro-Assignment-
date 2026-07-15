<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

/**
 * Authorization policies for Task resource access.
 */
final class TaskPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('tasks.view');
    }

    public function view(User $actor, Task $task): bool
    {
        return $actor->can('tasks.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('tasks.manage');
    }

    public function update(User $actor, Task $task): bool
    {
        return $actor->can('tasks.manage');
    }

    public function delete(User $actor, Task $task): bool
    {
        return $actor->can('tasks.manage');
    }
}
