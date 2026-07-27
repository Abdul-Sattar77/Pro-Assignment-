<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Files;

use App\Http\Controllers\Controller;
use App\Http\Requests\Files\StoreFileRequest;
use App\Http\Resources\FileResource;
use App\Models\Assignment;
use App\Models\File;
use App\Models\User;
use App\Services\Files\FileService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * File management controller for workspace and assignment files.
 */
final class FileController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly FileService $files) {}

    public function index(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('view', $assignment);

        $files = $assignment->files()->with(['uploader', 'assignment'])->get();

        return ApiResponse::collection(FileResource::collection($files));
    }

    public function indexAll(Request $request): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $filters = [
            'search' => $request->query('search'),
            'type' => $request->query('type'),
            'uploaded_by' => $request->query('uploaded_by'),
            'sort_by' => $request->query('sort_by'),
            'sort_order' => $request->query('sort_order'),
        ];

        $files = $this->files->listAll($actor, array_filter($filters, fn ($v) => $v !== null && $v !== ''));

        return ApiResponse::collection(FileResource::collection($files));
    }

    public function show(Request $request, File $file): JsonResponse
    {
        $this->authorize('view', $file);

        return ApiResponse::resource(FileResource::make($file->load(['uploader', 'assignment'])));
    }

    public function update(Request $request, File $file): JsonResponse
    {
        $this->authorize('update', $file);

        $validated = $request->validate([
            'original_name' => ['sometimes', 'string', 'max:255'],
            'name' => ['sometimes', 'string', 'max:255'],
            'note' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'version' => ['sometimes', 'integer', 'min:1'],
        ]);

        if (isset($validated['name']) && !isset($validated['original_name'])) {
            $validated['original_name'] = $validated['name'];
        }
        if (isset($validated['notes']) && !isset($validated['note'])) {
            $validated['note'] = $validated['notes'];
        }

        $file->update($validated);

        return ApiResponse::resource(FileResource::make($file->fresh(['uploader', 'assignment'])));
    }

    public function store(StoreFileRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var UploadedFile $upload */
        $upload = $request->file('file');

        /** @var User $actor */
        $actor = $request->user();

        /** @var string|null $note */
        $note = $request->validated('note');

        $file = $this->files->upload($assignment, $actor, $upload, $note);

        return ApiResponse::resource(FileResource::make($file->load(['uploader', 'assignment'])), 201);
    }

    public function uploadGeneral(StoreFileRequest $request): JsonResponse
    {
        /** @var UploadedFile $upload */
        $upload = $request->file('file');

        /** @var User $actor */
        $actor = $request->user();

        $file = $this->files->uploadGeneral($actor, $upload);

        return ApiResponse::resource(FileResource::make($file->load(['uploader', 'assignment'])), 201);
    }

    public function download(Request $request, File $file): StreamedResponse
    {
        $this->authorize('view', $file);

        return $this->files->download($file);
    }

    public function destroy(Request $request, File $file): JsonResponse
    {
        $this->authorize('delete', $file);

        $this->files->delete($file);

        return ApiResponse::noContent();
    }
}
