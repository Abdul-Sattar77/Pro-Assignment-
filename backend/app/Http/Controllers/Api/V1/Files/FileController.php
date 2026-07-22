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
 * File endpoints scoped to an assignment. Thin: authorize → service → resource.
 * Binaries are streamed from an authorized download route (no public URLs).
 */
final class FileController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly FileService $files) {}

    public function index(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('view', $assignment);

        $files = $assignment->files()->with('uploader')->get();

        return ApiResponse::collection(FileResource::collection($files));
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

        return ApiResponse::resource(FileResource::make($file->load('uploader')), 201);
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
