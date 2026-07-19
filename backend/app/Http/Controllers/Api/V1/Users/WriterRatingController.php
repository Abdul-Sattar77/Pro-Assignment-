<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Users;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreWriterRatingRequest;
use App\Http\Resources\WriterRatingResource;
use App\Models\Assignment;
use App\Models\User;
use App\Repositories\Contracts\WriterRatingRepositoryInterface;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WriterRatingController extends Controller
{
    public function __construct(
        private readonly WriterRatingRepositoryInterface $repository,
    ) {}

    public function index(Request $request, User $user): JsonResponse
    {
        // Enforce that only writers can be queried for ratings
        if (!$user->hasRole(Role::Writer->value)) {
            return ApiResponse::error('INVALID_USER_ROLE', 'Only writers can have performance ratings.', 400);
        }

        $list = $this->repository->getForWriter((int) $user->id);

        return ApiResponse::resource(WriterRatingResource::collection($list));
    }

    public function store(StoreWriterRatingRequest $request, User $user): JsonResponse
    {
        if (!$user->hasRole(Role::Writer->value)) {
            return ApiResponse::error('INVALID_USER_ROLE', 'Only writers can be rated.', 400);
        }

        $data = $request->validated();

        // Resolve assignment
        $assignment = Assignment::query()->where('uuid', $data['assignmentId'])->first();
        if ($assignment === null) {
            return ApiResponse::error('ASSIGNMENT_NOT_FOUND', 'The requested assignment does not exist.', 404);
        }

        // Verify that the rating is for this assignment's writer
        if ((int) $assignment->writer_id !== (int) $user->id) {
            return ApiResponse::error('INVALID_WRITER', 'The rated user is not the writer assigned to this assignment.', 400);
        }

        $quality = (int) $data['quality'];
        $timeliness = (int) $data['timeliness'];
        $communication = (int) $data['communication'];
        $overall = ($quality + $timeliness + $communication) / 3.0;

        $rating = $this->repository->create([
            'writer_id' => $user->id,
            'client_id' => $request->user()?->id,
            'assignment_id' => $assignment->id,
            'quality' => $quality,
            'timeliness' => $timeliness,
            'communication' => $communication,
            'overall_rating' => $overall,
            'comment' => $data['comment'] ?? null,
        ]);

        return ApiResponse::resource(WriterRatingResource::make($rating->load(['writer', 'client', 'assignment'])), 201);
    }
}
