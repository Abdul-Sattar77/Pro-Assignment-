<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Assignments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assignments\AssignWriterRequest;
use App\Http\Requests\Assignments\RevisionRequest;
use App\Http\Requests\Assignments\StoreAssignmentRequest;
use App\Http\Requests\Assignments\WorkflowNoteRequest;
use App\Http\Resources\AssignmentResource;
use App\Models\Assignment;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Services\Assignments\AssignmentService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Assignment workflow endpoints. Thin: authorize → validate → one service
 * call → resource. Route-model binding resolves {assignment} by uuid.
 */
final class AssignmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly AssignmentService $service,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Assignment::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        $paginator = $this->assignments->paginateFor(
            $this->actor($request),
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'search' => is_string($search) ? $search : null,
            ],
            is_string($sort) ? $sort : '-created_at',
            min(is_numeric($perPage) ? (int) $perPage : 15, 100),
        );

        return ApiResponse::collection(
            AssignmentResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreAssignmentRequest $request): JsonResponse
    {
        /** @var array{title: string, subject: string, description: string, deadline: string} $data */
        $data = $request->validated();

        $assignment = $this->service->create($this->actor($request), $data);

        return $this->show($request, $assignment->refresh(), 201);
    }

    public function show(Request $request, Assignment $assignment, int $status = 200): JsonResponse
    {
        $this->authorize('view', $assignment);

        $assignment->load(['client', 'writer', 'projectManager', 'events.actor']);

        return ApiResponse::resource(AssignmentResource::make($assignment), $status);
    }

    public function assign(AssignWriterRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var string $writerId */
        $writerId = $request->validated('writerId');

        $updated = $this->service->assignWriter($this->actor($request), $assignment, $writerId);

        return $this->show($request, $updated);
    }

    public function accept(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('submit', $assignment);

        $updated = $this->service->accept($this->actor($request), $assignment);

        return $this->show($request, $updated);
    }

    public function reject(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('submit', $assignment);

        $updated = $this->service->reject($this->actor($request), $assignment, $request->note());

        return $this->show($request, $updated);
    }

    public function submit(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('submit', $assignment);

        $updated = $this->service->submit($this->actor($request), $assignment, $request->note());

        return $this->show($request, $updated);
    }

    public function returnToWriter(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('review', $assignment);

        $updated = $this->service->returnToWriter($this->actor($request), $assignment, $request->note());

        return $this->show($request, $updated);
    }

    public function deliver(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('review', $assignment);

        $updated = $this->service->deliver($this->actor($request), $assignment, $request->note());

        return $this->show($request, $updated);
    }

    public function requestRevision(RevisionRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var string $note */
        $note = $request->validated('note');

        $updated = $this->service->requestRevision($this->actor($request), $assignment, $note);

        return $this->show($request, $updated);
    }

    public function complete(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('requestRevision', $assignment);

        $updated = $this->service->complete($this->actor($request), $assignment);

        return $this->show($request, $updated);
    }

    public function cancel(WorkflowNoteRequest $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('cancel', $assignment);

        $updated = $this->service->cancel($this->actor($request), $assignment, $request->note());

        return $this->show($request, $updated);
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
