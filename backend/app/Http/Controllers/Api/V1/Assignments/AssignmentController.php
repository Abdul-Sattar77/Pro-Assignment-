<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Assignments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assignments\AssignManagerRequest;
use App\Http\Requests\Assignments\AssignWriterRequest;
use App\Http\Requests\Assignments\RevisionRequest;
use App\Http\Requests\Assignments\StoreAssignmentRequest;
use App\Http\Requests\Assignments\UpdateAssignmentRequest;
use App\Http\Requests\Assignments\UploadAttachmentRequest;
use App\Http\Requests\Assignments\WorkflowNoteRequest;
use App\Http\Resources\AssignmentAttachmentResource;
use App\Http\Resources\AssignmentResource;
use App\Models\Assignment;
use App\Models\AssignmentAttachment;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Assignments\AssignmentService;
use App\Services\Assignments\AttachmentService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Assignment workflow endpoints. Thin: authorize → validate → one service
 * call → resource. Route-model binding resolves {assignment} by uuid.
 */
final class AssignmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly AssignmentService $service,
        private readonly AttachmentService $attachmentService,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly UserRepositoryInterface $users,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Assignment::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        // Resolve writer / PM uuid → internal id for repository filters
        $writerId = null;
        if (is_string($filter['writer'] ?? null) && $filter['writer'] !== '') {
            $writer = $this->users->findByUuid($filter['writer']);
            $writerId = $writer?->getKey();
        }

        $pmId = null;
        if (is_string($filter['project_manager'] ?? null) && $filter['project_manager'] !== '') {
            $pm = $this->users->findByUuid($filter['project_manager']);
            $pmId = $pm?->getKey();
        }

        $paginator = $this->assignments->paginateFor(
            $this->actor($request),
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'search' => is_string($search) ? $search : null,
                'priority' => is_string($filter['priority'] ?? null) ? $filter['priority'] : null,
                'writer_id' => $writerId,
                'project_manager_id' => $pmId,
                'deadline_from' => is_string($filter['deadline_from'] ?? null) ? $filter['deadline_from'] : null,
                'deadline_to' => is_string($filter['deadline_to'] ?? null) ? $filter['deadline_to'] : null,
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
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $assignment = $this->service->create($this->actor($request), $data);

        return $this->show($request, $assignment->refresh(), 201);
    }

    public function show(Request $request, Assignment $assignment, int $status = 200): JsonResponse
    {
        $this->authorize('view', $assignment);

        $assignment->load(['client', 'writer', 'projectManager', 'events.actor', 'attachments.uploader', 'attachments.assignment']);

        return ApiResponse::resource(AssignmentResource::make($assignment), $status);
    }

    public function update(UpdateAssignmentRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $updated = $this->service->update($this->actor($request), $assignment, $data);

        return $this->show($request, $updated);
    }

    public function assign(AssignWriterRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var string $writerId */
        $writerId = $request->validated('writerId');

        $updated = $this->service->assignWriter($this->actor($request), $assignment, $writerId);

        return $this->show($request, $updated);
    }

    public function assignManager(AssignManagerRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var string $managerId */
        $managerId = $request->validated('managerId');

        $updated = $this->service->assignManager($this->actor($request), $assignment, $managerId);

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

    // ---- Attachment endpoints ----

    public function listAttachments(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('view', $assignment);

        $attachments = $assignment->attachments()->with('uploader', 'assignment')->get();

        return ApiResponse::resource(
            AssignmentAttachmentResource::collection($attachments),
        );
    }

    public function uploadAttachment(UploadAttachmentRequest $request, Assignment $assignment): JsonResponse
    {
        $file = $request->file('file');
        /** @var string $type */
        $type = $request->validated('type');

        $attachment = $this->attachmentService->upload(
            $this->actor($request),
            $assignment,
            $file,
            $type,
        );

        return ApiResponse::resource(AssignmentAttachmentResource::make($attachment), 201);
    }

    public function downloadAttachment(Request $request, Assignment $assignment, AssignmentAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $assignment);

        return $this->attachmentService->download($attachment);
    }

    public function deleteAttachment(Request $request, Assignment $assignment, AssignmentAttachment $attachment): JsonResponse
    {
        $this->authorize('deleteAttachment', $assignment);

        $this->attachmentService->delete($this->actor($request), $attachment);

        return response()->json(['message' => 'Attachment deleted.']);
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
