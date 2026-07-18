<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;

interface ActivityRepositoryInterface
{
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator;
}
