<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\InvoiceStatus;
use App\Enums\Role;
use App\Models\Invoice;
use App\Models\User;
use App\Repositories\Contracts\InvoiceRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

final class InvoiceRepository extends BaseRepository implements InvoiceRepositoryInterface
{
    private const SORTABLE = ['amount', 'due_date', 'created_at', 'status', 'invoice_number'];

    public function __construct(Invoice $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Invoice
    {
        return Invoice::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Invoice
    {
        return Invoice::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Invoice
    {
        return Invoice::query()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->fill($data);
        $model->save();
        return $model->refresh();
    }

    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Invoice::query()->with(['client', 'assignment']);

        $this->scopeToActor($query, $actor);

        // Status filter
        $status = $filters['status'] ?? null;
        if (is_string($status) && in_array($status, InvoiceStatus::values(), true)) {
            $query->where('status', $status);
        }

        // Client filter (internal ID)
        $clientId = $filters['client_id'] ?? null;
        if (is_int($clientId)) {
            $query->where('client_id', $clientId);
        }

        // Assignment filter (internal ID)
        $assignmentId = $filters['assignment_id'] ?? null;
        if (is_int($assignmentId)) {
            $query->where('assignment_id', $assignmentId);
        }

        // Search filter (invoice number or client name)
        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('invoice_number', 'ilike', "%{$search}%")
                    ->orWhereHas('client', function (Builder $sq) use ($search): void {
                        $sq->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (!in_array($column, self::SORTABLE, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        return $query->orderBy($column, $direction)->paginate($perPage);
    }

    private function scopeToActor(Builder $query, User $actor): void
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return;
        }

        // Clients see their own invoices only
        if ($actor->hasRole(Role::Client->value)) {
            $query->where('client_id', $actor->getKey());
            return;
        }

        // Writers don't see any invoices
        $query->whereRaw('1 = 0');
    }
}
