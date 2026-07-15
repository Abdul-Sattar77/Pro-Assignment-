<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\AssignTaskRequest;
use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Tasks\TaskService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Task management endpoints. Thin: authorize → validate → service → resource.
 */
final class TaskController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly TaskService $service,
        private readonly TaskRepositoryInterface $tasks,
        private readonly UserRepositoryInterface $users,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        // Resolve relation UUIDs to internal IDs for repository querying
        $assignedUserId = null;
        if (is_string($filter['assignedUser'] ?? null) && $filter['assignedUser'] !== '') {
            $user = $this->users->findByUuid($filter['assignedUser']);
            $assignedUserId = $user?->getKey();
        }

        $assignmentId = null;
        if (is_string($filter['assignment'] ?? null) && $filter['assignment'] !== '') {
            $assignment = $this->assignments->findByUuid($filter['assignment']);
            $assignmentId = $assignment?->getKey();
        }

        $paginator = $this->tasks->paginate(
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'priority' => is_string($filter['priority'] ?? null) ? $filter['priority'] : null,
                'assigned_user_id' => $assignedUserId,
                'assignment_id' => $assignmentId,
                'search' => is_string($search) ? $search : null,
            ],
            is_string($sort) ? $sort : '-created_at',
            min(is_numeric($perPage) ? (int) $perPage : 15, 100),
        );

        return ApiResponse::collection(
            TaskResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        /** @var array{title: string, description?: string|null, assignmentId?: string|null, assignedUserId?: string|null, priority: string, status?: string|null, dueDate?: string|null, notes?: string|null} $data */
        $data = $request->validated();

        $task = $this->service->create($this->actor($request), $data);

        return ApiResponse::resource(TaskResource::make($task->load(['assignment', 'assignedUser', 'creator'])), 201);
    }

    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return ApiResponse::resource(TaskResource::make($task->load(['assignment', 'assignedUser', 'creator'])));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $updated = $this->service->update($task, $data);

        return ApiResponse::resource(TaskResource::make($updated->load(['assignment', 'assignedUser', 'creator'])));
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $this->service->delete($task);

        return response()->json(['message' => 'Task deleted.']);
    }

    public function assign(AssignTaskRequest $request, Task $task): JsonResponse
    {
        /** @var string|null $assignedUserId */
        $assignedUserId = $request->validated('assignedUserId');

        $updated = $this->service->assign($task, $assignedUserId);

        return ApiResponse::resource(TaskResource::make($updated->load(['assignment', 'assignedUser', 'creator'])));
    }

    public function complete(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $updated = $this->service->complete($task);

        return ApiResponse::resource(TaskResource::make($updated->load(['assignment', 'assignedUser', 'creator'])));
    }

    public function cancel(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $updated = $this->service->cancel($task);

        return ApiResponse::resource(TaskResource::make($updated->load(['assignment', 'assignedUser', 'creator'])));
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
