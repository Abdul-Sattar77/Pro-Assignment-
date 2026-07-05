<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Eloquent implementation of the user data-access contract. Uses User::query()
 * directly so the User type flows through to every single-model return.
 */
final class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /** Whitelisted sortable columns (api-standards §9). */
    private const SORTABLE = ['name', 'email', 'created_at'];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?User
    {
        return User::query()->find($id);
    }

    public function findByUuid(string $uuid): ?User
    {
        return User::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = User::query()->with('roles');

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $role = $filters['role'] ?? null;
        if (is_string($role) && $role !== '') {
            $query->whereHas('roles', fn ($q) => $q->where('name', $role));
        }

        $status = $filters['status'] ?? null;
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (!in_array($column, self::SORTABLE, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }

    public function countActiveWithRoleExcept(string $role, int $exceptId): int
    {
        return User::query()
            ->where('is_active', true)
            ->whereKeyNot($exceptId)
            ->whereHas('roles', fn ($q) => $q->where('name', $role))
            ->count();
    }
}
