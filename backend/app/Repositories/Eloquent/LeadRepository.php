<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

final class LeadRepository extends BaseRepository implements LeadRepositoryInterface
{
    /** Whitelisted sortable columns. */
    private const SORTABLE = ['name', 'email', 'created_at', 'status', 'source'];

    public function __construct(Lead $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Lead
    {
        return Lead::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Lead
    {
        return Lead::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Lead
    {
        return Lead::query()->create($data);
    }

    public function paginate(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Lead::query();

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $status = $filters['status'] ?? null;
        if (is_string($status) && $status !== '') {
            $query->where('status', $status);
        }

        $source = $filters['source'] ?? null;
        if (is_string($source) && $source !== '') {
            $query->where('source', $source);
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (!in_array($column, self::SORTABLE, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }
}
