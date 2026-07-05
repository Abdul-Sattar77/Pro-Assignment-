<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\AssignmentStatus;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

final class AssignmentRepository extends BaseRepository implements AssignmentRepositoryInterface
{
    /** Whitelisted sortable columns (api-standards §9). */
    private const SORTABLE = ['deadline', 'created_at', 'title'];

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
        return Assignment::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Assignment
    {
        return Assignment::query()->create($data);
    }

    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Assignment::query()->with(['client', 'writer', 'projectManager']);

        $this->scopeToActor($query, $actor);

        $status = $filters['status'] ?? null;
        if (is_string($status) && in_array($status, AssignmentStatus::values(), true)) {
            $query->where('status', $status);
        }

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('subject', 'ilike', "%{$search}%");
            });
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
