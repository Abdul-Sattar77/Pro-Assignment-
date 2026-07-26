<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\AssignmentPriority;
use App\Enums\AssignmentStatus;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

final class AssignmentRepository extends BaseRepository implements AssignmentRepositoryInterface
{
    /** Whitelisted sortable columns (api-standards §9). */
    private const SORTABLE = ['deadline', 'created_at', 'title', 'priority', 'word_count'];

    public function __construct(Assignment $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Assignment
    {
        return Assignment::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Assignment
    {
        if ($uuid === 'unassigned' || !\Illuminate\Support\Str::isUuid($uuid)) {
            return null;
        }

        return Assignment::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Assignment
    {
        return Assignment::query()->create($data);
    }

    /**
     * Update a model's attributes and persist. Satisfies the base
     * RepositoryInterface::update(Model, array): Model contract.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Model $model, array $data): Model
    {
        $model->fill($data);
        $model->save();

        return $model->refresh();
    }

    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Assignment::query()->with(['client', 'writer', 'projectManager']);

        $this->scopeToActor($query, $actor);

        // Status filter
        $status = $filters['status'] ?? null;
        if (is_string($status) && in_array($status, AssignmentStatus::values(), true)) {
            $query->where('status', $status);
        }

        // Priority filter
        $priority = $filters['priority'] ?? null;
        if (is_string($priority) && in_array($priority, AssignmentPriority::values(), true)) {
            $query->where('priority', $priority);
        }

        // Search (Assignment ID, Client Name, Writer Name, Title, Subject)
        $search = $filters['search'] ?? null;
        if (is_string($search) && trim($search) !== '') {
            $term = trim($search);
            $cleanNumeric = preg_replace('/[^0-9]/', '', $term);

            $query->where(function (Builder $q) use ($term, $cleanNumeric): void {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('subject', 'like', "%{$term}%")
                    ->orWhere('uuid', 'like', "%{$term}%")
                    ->orWhereHas('client', function (Builder $cq) use ($term): void {
                        $cq->where('name', 'like', "%{$term}%");
                    })
                    ->orWhereHas('writer', function (Builder $wq) use ($term): void {
                        $wq->where('name', 'like', "%{$term}%");
                    });

                if ($cleanNumeric !== '') {
                    $q->orWhere('id', (int) $cleanNumeric);
                }
            });
        }

        // Writer filter (by internal id — controller resolves uuid → id)
        $writerId = $filters['writer_id'] ?? null;
        if (is_int($writerId)) {
            $query->where('writer_id', $writerId);
        }

        // PM filter (by internal id — controller resolves uuid → id)
        $pmId = $filters['project_manager_id'] ?? null;
        if ($pmId === 'unassigned') {
            $query->whereNull('project_manager_id');
        } elseif (is_int($pmId)) {
            $query->where('project_manager_id', $pmId);
        }

        // Deadline range
        $from = $filters['deadline_from'] ?? null;
        if (is_string($from) && $from !== '') {
            $query->where('deadline', '>=', $from);
        }
        $to = $filters['deadline_to'] ?? null;
        if (is_string($to) && $to !== '') {
            $query->where('deadline', '<=', $to);
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (!in_array($column, self::SORTABLE, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }

    /**
     * Role-scoped visibility — the single place list access is constrained.
     *
     * @param  Builder<Assignment>  $query
     */
    private function scopeToActor(Builder $query, User $actor): void
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return; // staff see everything
        }

        if ($actor->hasRole(Role::Writer->value)) {
            $query->where('writer_id', $actor->getKey());

            return;
        }

        $query->where('client_id', $actor->getKey());
    }
}
