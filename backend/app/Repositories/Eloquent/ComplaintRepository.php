<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Complaint;
use App\Repositories\Contracts\ComplaintRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

final class ComplaintRepository implements ComplaintRepositoryInterface
{
    public function findByUuid(string $uuid): ?Complaint
    {
        return Complaint::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Complaint
    {
        return Complaint::query()->create($data);
    }

    public function update(Complaint $complaint, array $data): Complaint
    {
        $complaint->update($data);

        return $complaint;
    }

    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Complaint::query()->with(['client', 'assignment', 'projectManager', 'resolver']);

        // Role-based scoping (Clients only see their own complaints)
        if (isset($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (isset($filters['project_manager_id'])) {
            $query->where('project_manager_id', $filters['project_manager_id']);
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($search): void {
                $q->where('subject', 'like', $search)
                    ->orWhere('description', 'like', $search);
            });
        }

        $sort = $filters['sort'] ?? '-created_at';
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');

        if (in_array($column, ['created_at', 'status', 'subject'], true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }
}
