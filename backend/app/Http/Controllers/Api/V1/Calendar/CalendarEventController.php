<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Calendar;

use App\Enums\CalendarEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\StoreCalendarEventRequest;
use App\Http\Requests\Calendar\UpdateCalendarEventRequest;
use App\Http\Resources\CalendarEventResource;
use App\Models\Assignment;
use App\Models\CalendarEvent;
use App\Models\Task;
use App\Models\User;
use App\Observers\AssignmentObserver;
use App\Observers\TaskObserver;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\CalendarEventRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Calendar\CalendarEventService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Controller exposing endpoints for Calendar Event listings and mutations.
 */
final class CalendarEventController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly CalendarEventService $service,
        private readonly CalendarEventRepositoryInterface $events,
        private readonly UserRepositoryInterface $users,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly TaskRepositoryInterface $tasks,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CalendarEvent::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);

        // Optional parameters for direct listing filters (not necessarily nested)
        $month = $request->query('month') ?? $filter['month'] ?? null;
        $date = $request->query('date') ?? $filter['date'] ?? null;
        $startDate = $request->query('start_date') ?? $filter['startDate'] ?? null;
        $endDate = $request->query('end_date') ?? $filter['endDate'] ?? null;

        // Resolve relations (UUIDs) to internal PK keys for query logic
        $assignmentId = null;
        if (is_string($filter['assignment'] ?? null) && $filter['assignment'] !== '') {
            $assignment = $this->assignments->findByUuid($filter['assignment']);
            $assignmentId = $assignment?->getKey();
        }

        $taskId = null;
        if (is_string($filter['task'] ?? null) && $filter['task'] !== '') {
            $task = $this->tasks->findByUuid($filter['task']);
            $taskId = $task?->getKey();
        }

        $userId = null;
        if (is_string($filter['user'] ?? null) && $filter['user'] !== '') {
            $user = $this->users->findByUuid($filter['user']);
            $userId = $user?->getKey();
        }

        $events = $this->events->getFilteredFor(
            $this->actor($request),
            [
                'month' => is_string($month) ? $month : null,
                'date' => is_string($date) ? $date : null,
                'start_date' => is_string($startDate) ? $startDate : null,
                'end_date' => is_string($endDate) ? $endDate : null,
                'event_type' => is_string($filter['eventType'] ?? null) ? $filter['eventType'] : null,
                'assignment_id' => $assignmentId,
                'task_id' => $taskId,
                'user_id' => $userId,
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
            ],
        );

        return ApiResponse::resource(CalendarEventResource::collection($events));
    }

    public function store(StoreCalendarEventRequest $request): JsonResponse
    {
        /** @var array{title: string, description?: string|null, eventType: string, startDate: string, endDate?: string|null, assignmentId?: string|null, taskId?: string|null, userId?: string|null, status?: string|null} $data */
        $data = $request->validated();

        $event = $this->service->create($this->actor($request), $data);

        return ApiResponse::resource(CalendarEventResource::make($event->load(['assignment', 'task', 'user', 'creator'])), 201);
    }

    public function show(CalendarEvent $calendar): JsonResponse
    {
        $this->authorize('view', $calendar);

        return ApiResponse::resource(CalendarEventResource::make($calendar->load(['assignment', 'task', 'user', 'creator'])));
    }

    public function update(UpdateCalendarEventRequest $request, CalendarEvent $calendar): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $updated = $this->service->update($calendar, $data);

        return ApiResponse::resource(CalendarEventResource::make($updated->load(['assignment', 'task', 'user', 'creator'])));
    }

    public function destroy(CalendarEvent $calendar): JsonResponse
    {
        $this->authorize('delete', $calendar);

        $this->service->delete($calendar);

        return response()->json(['message' => 'Calendar event deleted.']);
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
