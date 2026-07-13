<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Task;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for Tasks.
 */
interface TaskRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?Task;

    public function findByUuid(string $uuid): ?Task;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Task;

    /**
     * Paginated, filtered, sorted listing.
     *
     * @param  array{search?: string|null, status?: string|null, priority?: string|null, assigned_user_id?: int|null, assignment_id?: int|null}  $filters
     * @param  string  $sort  whitelisted sort, "-" prefix = descending
     * @return LengthAwarePaginator<int, Task>
     */
    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator;
}
