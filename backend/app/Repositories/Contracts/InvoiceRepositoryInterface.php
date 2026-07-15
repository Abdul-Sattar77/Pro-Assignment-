<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for Invoices.
 */
interface InvoiceRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?Invoice;

    public function findByUuid(string $uuid): ?Invoice;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Invoice;

    /**
     * Paginated, filtered, sorted listing scoped by actor.
     *
     * @param  array{search?: string|null, status?: string|null, client_id?: int|null, assignment_id?: int|null}  $filters
     * @param  string  $sort
     * @return LengthAwarePaginator<int, Invoice>
     */
    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator;
}
