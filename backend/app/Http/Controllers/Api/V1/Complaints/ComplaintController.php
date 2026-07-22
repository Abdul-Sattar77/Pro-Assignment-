<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Complaints;

use App\Http\Controllers\Controller;
use App\Http\Requests\Complaints\StoreComplaintRequest;
use App\Http\Requests\Complaints\UpdateComplaintRequest;
use App\Http\Resources\ComplaintResource;
use App\Models\Assignment;
use App\Models\Complaint;
use App\Repositories\Contracts\ComplaintRepositoryInterface;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ComplaintController extends Controller
{
    public function __construct(
        private readonly ComplaintRepositoryInterface $repository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null) {
            return ApiResponse::error('UNAUTHORIZED', 'You must log in to view complaints.', 401);
        }

        $filters = [
            'status' => $request->query('status'),
            'search' => $request->query('search'),
            'sort' => $request->query('sort', '-created_at'),
        ];

        // Enforce role-based isolation scoping
        if ($actor->hasRole('client')) {
            $filters['client_id'] = $actor->id;
        } elseif ($actor->hasRole('writer')) {
            return ApiResponse::error('FORBIDDEN', 'Writers do not have access to Complaint Management.', 403);
        } elseif ($actor->hasRole('project_manager')) {
            // Optional: PMs can view complaints linked to assignments they manage, or all
            $filters['project_manager_id'] = $actor->id;
        }

        $perPage = $request->query('per_page', '15');
        $paginator = $this->repository->getFiltered(
            $filters,
            is_numeric($perPage) ? (int) $perPage : 15,
        );

        return ApiResponse::collection(
            ComplaintResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('client')) {
            return ApiResponse::error('FORBIDDEN', 'Only clients can submit complaints.', 403);
        }

        $data = $request->validated();

        $assignmentId = null;
        $pmId = null;

        if (isset($data['assignmentId'])) {
            $assignment = Assignment::query()->where('uuid', $data['assignmentId'])->first();
            if ($assignment !== null) {
                $assignmentId = $assignment->id;
                $pmId = $assignment->project_manager_id;
            }
        }

        $complaint = $this->repository->create([
            'client_id' => $actor->id,
            'assignment_id' => $assignmentId,
            'project_manager_id' => $pmId,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'status' => 'pending',
        ]);

        return ApiResponse::resource(ComplaintResource::make($complaint->load(['client', 'assignment', 'projectManager'])), 201);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null) {
            return ApiResponse::error('UNAUTHORIZED', 'You must log in.', 401);
        }

        // Validate client visibility boundaries
        if ($actor->hasRole('client') && (int) $complaint->client_id !== (int) $actor->id) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view this complaint.', 403);
        }

        if ($actor->hasRole('writer')) {
            return ApiResponse::error('FORBIDDEN', 'Writers do not have access to Complaints.', 403);
        }

        return ApiResponse::resource(ComplaintResource::make($complaint->load(['client', 'assignment', 'projectManager', 'resolver'])));
    }

    public function update(UpdateComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $data = $request->validated();
        $actor = $request->user();

        $updateData = [
            'status' => $data['status'],
        ];

        if (in_array($data['status'], ['resolved', 'dismissed'], true)) {
            $updateData['resolution'] = $data['resolution'] ?? null;
            $updateData['resolved_at'] = now();
            $updateData['resolved_by'] = $actor?->id;
        }

        // Handle assignment to PM
        if (array_key_exists('projectManagerId', $data)) {
            if ($data['projectManagerId'] === null) {
                $updateData['project_manager_id'] = null;
            } else {
                $pm = \App\Models\User::query()->where('uuid', $data['projectManagerId'])->first();
                $updateData['project_manager_id'] = $pm?->id;
            }
        }

        // Handle assignment to Writer
        if (array_key_exists('writerId', $data)) {
            if ($data['writerId'] === null) {
                $updateData['writer_id'] = null;
            } else {
                $writer = \App\Models\User::query()->where('uuid', $data['writerId'])->first();
                $updateData['writer_id'] = $writer?->id;
            }
        }

        $updated = $this->repository->update($complaint, $updateData);

        return ApiResponse::resource(ComplaintResource::make($updated->load(['client', 'assignment', 'projectManager', 'writer', 'resolver'])));
    }
}
