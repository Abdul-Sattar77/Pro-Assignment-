<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreDocumentTemplateRequest;
use App\Http\Requests\Documents\UpdateDocumentTemplateRequest;
use App\Http\Resources\DocumentTemplateResource;
use App\Models\DocumentTemplate;
use App\Models\File;
use App\Repositories\Contracts\DocumentTemplateRepositoryInterface;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DocumentTemplateController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DocumentTemplateRepositoryInterface $repository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DocumentTemplate::class);

        $filters = [
            'category' => $request->query('category'),
            'search' => $request->query('search'),
            'sort' => $request->query('sort', '-created_at'),
        ];

        $perPage = $request->query('per_page', '15');
        $paginator = $this->repository->getFiltered(
            $filters,
            is_numeric($perPage) ? (int) $perPage : 15,
        );

        return ApiResponse::collection(
            DocumentTemplateResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreDocumentTemplateRequest $request): JsonResponse
    {
        $this->authorize('create', DocumentTemplate::class);

        $actor = $request->user();
        $data = $request->validated();

        $fileId = null;
        if (isset($data['fileId'])) {
            $file = File::query()->where('uuid', $data['fileId'])->first();
            if ($file !== null) {
                $fileId = $file->id;
            }
        }

        $template = $this->repository->create([
            'title' => $data['title'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'file_id' => $fileId,
            'uploaded_by' => $actor?->id,
        ]);

        return ApiResponse::resource(DocumentTemplateResource::make($template->load(['file', 'uploader'])), 201);
    }

    public function show(DocumentTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('view', $documentTemplate);

        return ApiResponse::resource(DocumentTemplateResource::make($documentTemplate->load(['file', 'uploader'])));
    }

    public function update(UpdateDocumentTemplateRequest $request, DocumentTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('update', $documentTemplate);

        $data = $request->validated();

        $payload = [];
        if (isset($data['title'])) {
            $payload['title'] = $data['title'];
        }
        if (isset($data['category'])) {
            $payload['category'] = $data['category'];
        }
        if (array_key_exists('description', $data)) {
            $payload['description'] = $data['description'];
        }
        if (isset($data['fileId'])) {
            $file = File::query()->where('uuid', $data['fileId'])->first();
            if ($file !== null) {
                $payload['file_id'] = $file->id;
            }
        }

        $updated = $this->repository->update($documentTemplate, $payload);

        return ApiResponse::resource(DocumentTemplateResource::make($updated->load(['file', 'uploader'])));
    }

    public function destroy(Request $request, DocumentTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('delete', $documentTemplate);

        $this->repository->delete($documentTemplate);

        return response()->json(['message' => 'Document template deleted successfully.']);
    }
}
