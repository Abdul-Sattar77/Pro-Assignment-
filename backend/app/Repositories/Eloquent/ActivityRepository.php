<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\ActivityRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Activitylog\Models\Activity;

final class ActivityRepository implements ActivityRepositoryInterface
{
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Activity::query()->with(['causer']);

        if (isset($filters['log_name']) && $filters['log_name'] !== '') {
            $query->where('log_name', $filters['log_name']);
        }

        if (isset($filters['causer_id']) && $filters['causer_id'] !== '') {
            $query->where('causer_id', $filters['causer_id']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search): void {
                $q->where('description', 'like', $search)
                  ->orWhere('log_name', 'like', $search);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
