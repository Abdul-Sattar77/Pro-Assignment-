<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Complaint;
use Illuminate\Pagination\LengthAwarePaginator;

interface ComplaintRepositoryInterface
{
    public function findByUuid(string $uuid): ?Complaint;

    public function create(array $data): Complaint;

    public function update(Complaint $complaint, array $data): Complaint;

    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator;
}
