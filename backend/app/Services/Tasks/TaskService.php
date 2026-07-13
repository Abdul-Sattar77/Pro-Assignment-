<?php

declare(strict_types=1);

namespace App\Services\Tasks;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Service managing all Task operations.
 */
final class TaskService
{
    public function __construct(
        private readonly TaskRepositoryInterface $tasks,
        private readonly UserRepositoryInterface $users,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    /**
     * Create a new task.
     *
     * @param  array{title: string, description?: string|null, assignmentId?: string|null, assignedUserId?: string|null, priority: string, status?: string|null, dueDate?: string|null, notes?: string|null}  $data
     */
    public function create(User $creator, array $data): Task
    {
        return DB::transaction(function () use ($creator, $data): Task {
            $resolvedData = $this->resolveRelations($data);
            $resolvedData['created_by_id'] = $creator->getKey();
            $resolvedData['status'] = $data['status'] ?? TaskStatus::Todo->value;

            if ($resolvedData['status'] === TaskStatus::Completed->value) {
                $resolvedData['completed_at'] = Carbon::now();
            }

            return $this->tasks->create($resolvedData);
        });
    }

    /**
     * Update an existing task.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data): Task {
            $resolvedData = $this->resolveRelations($data);

            if (isset($resolvedData['status'])) {
                $oldStatus = $task->status->value;
                $newStatus = $resolvedData['status'];

                if ($newStatus === TaskStatus::Completed->value && $oldStatus !== TaskStatus::Completed->value) {
                    $resolvedData['completed_at'] = Carbon::now();
                } elseif ($newStatus !== TaskStatus::Completed->value) {
                    $resolvedData['completed_at'] = null;
                }
            }

            return $this->tasks->update($task, $resolvedData);
        });
    }

    /**
     * Assign a user to the task.
     */
    public function assign(Task $task, ?string $userUuid): Task
    {
        return DB::transaction(function () use ($task, $userUuid): Task {
            $userId = null;
            if ($userUuid !== null && $userUuid !== '') {
                $user = $this->users->findByUuid($userUuid);
                $userId = $user?->getKey();
            }

            return $this->tasks->update($task, ['assigned_user_id' => $userId]);
        });
    }

    /**
     * Mark task as completed.
     */
    public function complete(Task $task): Task
    {
        return DB::transaction(function () use ($task): Task {
            return $this->tasks->update($task, [
                'status' => TaskStatus::Completed->value,
                'completed_at' => Carbon::now(),
            ]);
        });
    }

    /**
     * Cancel a task.
     */
    public function cancel(Task $task): Task
    {
        return DB::transaction(function () use ($task): Task {
            return $this->tasks->update($task, [
                'status' => TaskStatus::Cancelled->value,
                'completed_at' => null,
            ]);
        });
    }

    /**
     * Delete a task.
     */
    public function delete(Task $task): bool
    {
        return DB::transaction(function () use ($task): bool {
            return $this->tasks->delete($task);
        });
    }

    /**
     * Resolve UUID relationships to internal PK IDs.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveRelations(array $data): array
    {
        $resolved = $data;

        if (array_key_exists('assignmentId', $data)) {
            $assignmentUuid = $data['assignmentId'];
            $resolved['assignment_id'] = null;
            if ($assignmentUuid !== null && $assignmentUuid !== '') {
                $assignment = $this->assignments->findByUuid($assignmentUuid);
                $resolved['assignment_id'] = $assignment?->getKey();
            }
            unset($resolved['assignmentId']);
        }

        if (array_key_exists('assignedUserId', $data)) {
            $userUuid = $data['assignedUserId'];
            $resolved['assigned_user_id'] = null;
            if ($userUuid !== null && $userUuid !== '') {
                $user = $this->users->findByUuid($userUuid);
                $resolved['assigned_user_id'] = $user?->getKey();
            }
            unset($resolved['assignedUserId']);
        }

        if (array_key_exists('dueDate', $data)) {
            $resolved['due_date'] = $data['dueDate'];
            unset($resolved['dueDate']);
        }

        return $resolved;
    }
}
