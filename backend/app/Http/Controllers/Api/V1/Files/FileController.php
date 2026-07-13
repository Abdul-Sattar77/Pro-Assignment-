<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Files;

use App\Http\Controllers\Controller;
use App\Http\Requests\Files\StoreFileRequest;
use App\Http\Requests\Files\UpdateFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\User;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Files\FileService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class FileController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FileService $service,
        private readonly FileRepositoryInterface $files,
        private readonly UserRepositoryInterface $users,
        private readonly AssignmentRepositoryInterface $assignments,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', File::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);

        // Resolve UUIDs to internal PK IDs
        $assignmentId = null;
        if (is_string($filter['assignment'] ?? null) && $filter['assignment'] !== '') {
            $assignment = $this->assignments->findByUuid($filter['assignment']);
            $assignmentId = $assignment?->getKey();
        }

        $uploaderId = null;
        if (is_string($filter['uploader'] ?? null) && $filter['uploader'] !== '') {
            $uploader = $this->users->findByUuid($filter['uploader']);
            $uploaderId = $uploader?->getKey();
        }

        $search = $request->query('search') ?? $filter['search'] ?? null;
        $type = $request->query('type') ?? $filter['type'] ?? null;
        $sortBy = $request->query('sort_by') ?? $filter['sortBy'] ?? 'created_at';
        $sortOrder = $request->query('sort_order') ?? $filter['sortOrder'] ?? 'desc';

        $filesList = $this->files->getFilteredFor(
            $this->actor($request),
            [
                'assignment_id' => $assignmentId,
                'uploaded_by' => $uploaderId,
                'search' => is_string($search) ? $search : null,
                'type' => is_string($type) ? $type : null,
                'sort_by' => is_string($sortBy) ? $sortBy : 'created_at',
                'sort_order' => is_string($sortOrder) ? $sortOrder : 'desc',
            ]
        );

        return ApiResponse::resource(FileResource::collection($filesList));
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        $uploaded = $request->file('file');
        if ($uploaded === null) {
            return ApiResponse::error('UPLOAD_FAILED', 'No file was uploaded.', 400);
        }

        /** @var array{assignmentId?: string|null} $data */
        $data = $request->validated();

        $file = $this->service->store($this->actor($request), $uploaded, $data);

        return ApiResponse::resource(FileResource::make($file->load(['assignment', 'uploader'])), 201);
    }

    public function show(File $file): JsonResponse
    {
        $this->authorize('view', $file);

        return ApiResponse::resource(FileResource::make($file->load(['assignment', 'uploader'])));
    }

    public function update(UpdateFileRequest $request, File $file): JsonResponse
    {
        /** @var array{filename: string} $data */
        $data = $request->validated();

        $updated = $this->service->rename($file, $data['filename']);

        return ApiResponse::resource(FileResource::make($updated->load(['assignment', 'uploader'])));
    }

    public function destroy(File $file): JsonResponse
    {
        $this->authorize('delete', $file);

        $this->service->delete($file);

        return response()->json(['message' => 'File deleted successfully.']);
    }

    /**
     * Download the file resource.
     */
    public function download(File $file): StreamedResponse|JsonResponse
    {
        $this->authorize('view', $file);

        if (!Storage::disk($file->disk)->exists($file->path)) {
            return ApiResponse::error('FILE_NOT_FOUND', 'The requested file does not exist on disk.', 404);
        }

        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
