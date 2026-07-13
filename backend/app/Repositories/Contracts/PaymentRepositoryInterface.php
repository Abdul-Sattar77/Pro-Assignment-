<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Data-access contract for Payments.
 */
interface PaymentRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?Payment;

    public function findByUuid(string $uuid): ?Payment;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Payment;

    /**
     * Paginated, filtered, sorted listing scoped by actor.
     *
     * @param  array{status?: string|null, payment_type?: string|null, assignment_id?: int|null, user_id?: int|null}  $filters
     * @param  string  $sort
     * @return LengthAwarePaginator<int, Payment>
     */
    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator;
}
