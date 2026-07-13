<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\Role;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

final class PaymentRepository extends BaseRepository implements PaymentRepositoryInterface
{
    private const SORTABLE = ['amount', 'created_at', 'status', 'payment_type', 'verified_at'];

    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?Payment
    {
        return Payment::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Payment
    {
        return Payment::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): Payment
    {
        return Payment::query()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->fill($data);
        $model->save();
        return $model->refresh();
    }

    public function paginateFor(User $actor, array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Payment::query()->with(['assignment', 'invoice', 'user', 'proofFile', 'verifiedBy']);

        $this->scopeToActor($query, $actor);

        // Status filter
        $status = $filters['status'] ?? null;
        if (is_string($status) && in_array($status, PaymentStatus::values(), true)) {
            $query->where('status', $status);
        }

        // Payment Type filter
        $type = $filters['payment_type'] ?? null;
        if (is_string($type) && in_array($type, PaymentType::values(), true)) {
            $query->where('payment_type', $type);
        }

        // Assignment filter (internal ID)
        $assignmentId = $filters['assignment_id'] ?? null;
        if (is_int($assignmentId)) {
            $query->where('assignment_id', $assignmentId);
        }

        // User filter (internal ID)
        $userId = $filters['user_id'] ?? null;
        if (is_int($userId)) {
            $query->where('user_id', $userId);
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

        if ($actor->hasRole(Role::Client->value)) {
            $query->where(function (Builder $q) use ($actor): void {
                $q->where('user_id', $actor->getKey())
                    ->orWhereHas('assignment', function (Builder $sq) use ($actor): void {
                        $sq->where('client_id', $actor->getKey());
                    })
                    ->orWhereHas('invoice', function (Builder $sq) use ($actor): void {
                        $sq->where('client_id', $actor->getKey());
                    });
            });
            return;
        }

        if ($actor->hasRole(Role::Writer->value)) {
            $query->where('user_id', $actor->getKey());
            return;
        }

        $query->whereRaw('1 = 0');
    }
}
