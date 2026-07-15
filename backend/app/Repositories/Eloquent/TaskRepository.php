<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

final class TaskRepository extends BaseRepository implements TaskRepositoryInterface
{
    /** Whitelisted sortable columns. */
    private const SORTABLE = ['title', 'priority', 'status', 'due_date', 'created_at'];

    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Task
    {
        return Task::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Task
    {
        return Task::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Task
    {
        return Task::query()->create($data);
    }

    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Task::query()->with(['assignment', 'assignedUser', 'creator']);

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%")
                    ->orWhere('notes', 'ilike', "%{$search}%");
            });
        }

        $status = $filters['status'] ?? null;
        if (is_string($status) && $status !== '') {
            $query->where('status', $status);
        }

        $priority = $filters['priority'] ?? null;
        if (is_string($priority) && $priority !== '') {
            $query->where('priority', $priority);
        }

        $assignedUserId = $filters['assigned_user_id'] ?? null;
        if ($assignedUserId !== null) {
            $query->where('assigned_user_id', $assignedUserId);
        }

        $assignmentId = $filters['assignment_id'] ?? null;
        if ($assignmentId !== null) {
            $query->where('assignment_id', $assignmentId);
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (!in_array($column, self::SORTABLE, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }
}
