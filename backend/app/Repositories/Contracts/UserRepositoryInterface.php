<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for users. Narrows the single-model return types to User
 * (covariant). `all()` keeps the base Collection<int, Model> type — Eloquent's
 * Collection is invariant in its element type, so it cannot be narrowed.
 */
interface UserRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?User;

    public function findByUuid(string $uuid): ?User;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): User;

    public function findByEmail(string $email): ?User;

    /**
     * Paginated, filtered, sorted listing (docs/api/api-standards.md §7–9).
     *
     * @param  array{search?: string|null, role?: string|null, status?: string|null}  $filters
     * @param  string  $sort  whitelisted sort, "-" prefix = descending
     * @return LengthAwarePaginator<int, User>
     */
    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator;

    /** Count of active users holding the given role, excluding one user id. */
    public function countActiveWithRoleExcept(string $role, int $exceptId): int;
}
