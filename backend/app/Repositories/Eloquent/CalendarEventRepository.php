<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\Role;
use App\Models\CalendarEvent;
use App\Models\User;
use App\Repositories\Contracts\CalendarEventRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

final class CalendarEventRepository extends BaseRepository implements CalendarEventRepositoryInterface
{
    public function __construct(CalendarEvent $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?CalendarEvent
    {
        return CalendarEvent::query()->find($id);
    }

    public function findByUuid(string $uuid): ?CalendarEvent
    {
        return CalendarEvent::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): CalendarEvent
    {
        return CalendarEvent::query()->create($data);
    }

    public function getFilteredFor(User $actor, array $filters): Collection
    {
        $query = CalendarEvent::query()->with(['assignment', 'task', 'user', 'creator']);

        // ---- RBAC Access Scoping ----
        $isAdmin = $actor->hasRole(Role::Admin->value);
        $isPm = $actor->hasRole(Role::ProjectManager->value);

        if (!$isAdmin && !$isPm) {
            if ($actor->hasRole(Role::Writer->value)) {
                // Writer: only see events where they are linked as assignee
                // OR assignment deadlines where they are the assigned writer on the assignment.
                $query->where(function ($q) use ($actor): void {
                    $q->where('user_id', $actor->getKey())
                        ->orWhereHas('assignment', function ($aq) use ($actor): void {
                            $aq->where('writer_id', $actor->getKey());
                        })
                        ->orWhereHas('task', function ($tq) use ($actor): void {
                            $tq->where('assigned_user_id', $actor->getKey());
                        });
                });
            } elseif ($actor->hasRole(Role::Client->value)) {
                // Client: only see events for their assignments
                $query->where(function ($q) use ($actor): void {
                    $q->whereHas('assignment', function ($aq) use ($actor): void {
                        $aq->where('client_id', $actor->getKey());
                    })
                        ->orWhereHas('task', function ($tq) use ($actor): void {
                            $tq->whereHas('assignment', function ($taq) use ($actor): void {
                                $taq->where('client_id', $actor->getKey());
                            });
                        });
                });
            } else {
                // Deny all other roles
                $query->whereRaw('1 = 0');
            }
        }

        // ---- Filtering ----
        $month = $filters['month'] ?? null;
        if (is_string($month) && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $start = Carbon::parse($month.'-01')->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $query->whereBetween('start_date', [$start, $end]);
        }

        $date = $filters['date'] ?? null;
        if (is_string($date) && $date !== '') {
            $query->whereDate('start_date', $date);
        }

        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        if (is_string($startDate) && is_string($endDate)) {
            $query->whereBetween('start_date', [Carbon::parse($startDate), Carbon::parse($endDate)]);
        }

        $eventType = $filters['event_type'] ?? null;
        if (is_string($eventType) && $eventType !== '') {
            $query->where('event_type', $eventType);
        }

        $assignmentId = $filters['assignment_id'] ?? null;
        if ($assignmentId !== null) {
            $query->where('assignment_id', $assignmentId);
        }

        $userId = $filters['user_id'] ?? null;
        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        $status = $filters['status'] ?? null;
        if (is_string($status) && $status !== '') {
            $query->where('status', $status);
        }

        return $query->orderBy('start_date', 'asc')->get();
    }
}
