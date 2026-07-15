<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\WriterRating;
use Illuminate\Support\Collection;

interface WriterRatingRepositoryInterface
{
    public function findByUuid(string $uuid): ?WriterRating;

    public function create(array $data): WriterRating;

    public function getForWriter(int $writerId): Collection;
}
