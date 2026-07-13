<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leads\StoreLeadRequest;
use App\Http\Requests\Leads\UpdateLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use App\Services\Leads\LeadService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Lead management endpoints. Thin: authorize → validate → service → resource.
 */
final class LeadController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly LeadService $service,
        private readonly LeadRepositoryInterface $leads,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Lead::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        $paginator = $this->leads->paginate(
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'source' => is_string($filter['source'] ?? null) ? $filter['source'] : null,
                'search' => is_string($search) ? $search : null,
            ],
            is_string($sort) ? $sort : '-created_at',
            min(is_numeric($perPage) ? (int) $perPage : 15, 100),
        );

        return ApiResponse::collection(
            LeadResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreLeadRequest $request): JsonResponse
    {
        /** @var array{name: string, email: string|null, phone: string|null, source: string, status?: string|null, notes?: string|null, lost_reason?: string|null} $data */
        $data = $request->validated();

        $lead = $this->service->create($data);

        return ApiResponse::resource(LeadResource::make($lead), 201);
    }

    public function show(Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);

        return ApiResponse::resource(LeadResource::make($lead));
    }

    public function update(UpdateLeadRequest $request, Lead $lead): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = $request->validated();

        $updated = $this->service->update($lead, $data);

        return ApiResponse::resource(LeadResource::make($updated));
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $this->authorize('delete', $lead);

        $this->service->delete($lead);

        return response()->json(['message' => 'Lead deleted.']);
    }
}
