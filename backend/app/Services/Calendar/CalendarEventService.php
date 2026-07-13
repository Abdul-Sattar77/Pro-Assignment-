<?php

declare(strict_types=1);

namespace App\Services\Calendar;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\CalendarEventRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Service managing calendar event registrations.
 */
final class CalendarEventService
{
    public function __construct(
        private readonly CalendarEventRepositoryInterface $events,
        private readonly UserRepositoryInterface $users,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly TaskRepositoryInterface $tasks,
    ) {}

    /**
     * Create a manual calendar event.
     *
     * @param  array{title: string, description?: string|null, eventType: string, startDate: string, endDate?: string|null, assignmentId?: string|null, taskId?: string|null, userId?: string|null, status?: string|null}  $data
     */
    public function create(User $creator, array $data): CalendarEvent
    {
        return DB::transaction(function () use ($creator, $data): CalendarEvent {
            $resolvedData = $this->resolveRelations($data);
            $resolvedData['created_by_id'] = $creator->getKey();

            return $this->events->create($resolvedData);
        });
    }

    /**
     * Update a manual calendar event.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(CalendarEvent $event, array $data): CalendarEvent
    {
        return DB::transaction(function () use ($event, $data): CalendarEvent {
            $resolvedData = $this->resolveRelations($data);

            return $this->events->update($event, $resolvedData);
        });
    }

    /**
     * Delete a calendar event.
     */
    public function delete(CalendarEvent $event): bool
    {
        return DB::transaction(function () use ($event): bool {
            return $this->events->delete($event);
        });
    }

    /**
     * Resolve relation UUIDs to internal PK IDs.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveRelations(array $data): array
    {
        $resolved = $data;

        if (array_key_exists('assignmentId', $data)) {
            $uuid = $data['assignmentId'];
            $resolved['assignment_id'] = null;
            if ($uuid !== null && $uuid !== '') {
                $assignment = $this->assignments->findByUuid($uuid);
                $resolved['assignment_id'] = $assignment?->getKey();
            }
            unset($resolved['assignmentId']);
        }

        if (array_key_exists('taskId', $data)) {
            $uuid = $data['taskId'];
            $resolved['task_id'] = null;
            if ($uuid !== null && $uuid !== '') {
                $task = $this->tasks->findByUuid($uuid);
                $resolved['task_id'] = $task?->getKey();
            }
            unset($resolved['taskId']);
        }

        if (array_key_exists('userId', $data)) {
            $uuid = $data['userId'];
            $resolved['user_id'] = null;
            if ($uuid !== null && $uuid !== '') {
                $user = $this->users->findByUuid($uuid);
                $resolved['user_id'] = $user?->getKey();
            }
            unset($resolved['userId']);
        }

        if (array_key_exists('eventType', $data)) {
            $resolved['event_type'] = $data['eventType'];
            unset($resolved['eventType']);
        }

        if (array_key_exists('startDate', $data)) {
            $resolved['start_date'] = Carbon::parse($data['startDate']);
            unset($resolved['startDate']);
        }

        if (array_key_exists('endDate', $data)) {
            $resolved['end_date'] = $data['endDate'] !== null && $data['endDate'] !== ''
                ? Carbon::parse($data['endDate'])
                : null;
            unset($resolved['endDate']);
        }

        return $resolved;
    }
}
