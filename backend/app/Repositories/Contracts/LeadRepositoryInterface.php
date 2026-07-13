<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Lead;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for Leads.
 */
interface LeadRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?Lead;

    public function findByUuid(string $uuid): ?Lead;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Lead;

    /**
     * Paginated, filtered, sorted listing.
     *
     * @param  array{search?: string|null, status?: string|null}  $filters
     * @param  string  $sort  whitelisted sort, "-" prefix = descending
     * @return LengthAwarePaginator<int, Lead>
     */
    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator;
}
