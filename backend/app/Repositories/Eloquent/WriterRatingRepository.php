<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\WriterRating;
use App\Repositories\Contracts\WriterRatingRepositoryInterface;
use Illuminate\Support\Collection;

final class WriterRatingRepository implements WriterRatingRepositoryInterface
{
    public function findByUuid(string $uuid): ?WriterRating
    {
        return WriterRating::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): WriterRating
    {
        return WriterRating::query()->create($data);
    }

    public function getForWriter(int $writerId): Collection
    {
        return WriterRating::query()
            ->with(['client', 'assignment'])
            ->where('writer_id', $writerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
