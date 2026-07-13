<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for assignments. Visibility is role-scoped at the
 * query level: clients see their own orders, writers their assigned work,
 * staff (admin/PM) everything.
 */
interface AssignmentRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?Assignment;

    public function findByUuid(string $uuid): ?Assignment;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Assignment;

    /**
     * @param  array{
     *   status?: string|null,
     *   search?: string|null,
     *   priority?: string|null,
     *   writer_id?: int|null,
     *   project_manager_id?: int|null,
     *   deadline_from?: string|null,
     *   deadline_to?: string|null,
     * }  $filters
     * @return LengthAwarePaginator<int, Assignment>
     */
    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator;
}
