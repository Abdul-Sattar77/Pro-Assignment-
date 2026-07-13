<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreInvoiceRequest;
use App\Http\Requests\Finance\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\InvoiceRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Finance\FinanceService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class InvoiceController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FinanceService $service,
        private readonly InvoiceRepositoryInterface $invoices,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly UserRepositoryInterface $users
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        // Resolve clientUuid -> client_id if present
        $clientId = null;
        if (is_string($filter['clientId'] ?? null)) {
            $client = $this->users->findByUuid($filter['clientId']);
            $clientId = $client?->id;
        }

        // Resolve assignmentUuid -> assignment_id if present
        $assignmentId = null;
        if (is_string($filter['assignmentId'] ?? null)) {
            $assignment = $this->assignments->findByUuid($filter['assignmentId']);
            $assignmentId = $assignment?->id;
        }

        $paginator = $this->invoices->paginateFor(
            $request->user(),
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'client_id' => $clientId,
                'assignment_id' => $assignmentId,
                'search' => is_string($search) ? $search : null,
            ],
            is_string($sort) ? $sort : '-created_at',
            min(is_numeric($perPage) ? (int) $perPage : 15, 100)
        );

        return ApiResponse::collection(
            InvoiceResource::collection($paginator->getCollection()),
            $paginator
        );
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        /** @var array{assignmentId: string, amount?: float|null, dueDate?: string|null, notes?: string|null} $data */
        $data = $request->validated();

        $assignment = $this->assignments->findByUuid($data['assignmentId']);
        if ($assignment === null) {
            return ApiResponse::error('ASSIGNMENT_NOT_FOUND', 'The selected assignment does not exist.', 404);
        }

        $invoice = $this->service->createInvoice($request->user(), [
            'assignment_id' => $assignment->id,
            'amount' => $data['amount'] ?? null,
            'due_date' => $data['dueDate'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return ApiResponse::resource(InvoiceResource::make($invoice->load(['client', 'assignment'])), 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $this->authorize('view', $invoice);

        return ApiResponse::resource(InvoiceResource::make($invoice->load(['client', 'assignment'])));
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        /** @var array{status?: string|null, dueDate?: string|null, notes?: string|null} $data */
        $data = $request->validated();

        $updateData = [];
        if (isset($data['status'])) {
            $updateData['status'] = $data['status'];
        }
        if (isset($data['dueDate'])) {
            $updateData['due_date'] = $data['dueDate'];
        }
        if (isset($data['notes'])) {
            $updateData['notes'] = $data['notes'];
        }

        $updated = $this->service->updateInvoice($request->user(), $invoice, $updateData);

        return ApiResponse::resource(InvoiceResource::make($updated->load(['client', 'assignment'])));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $this->authorize('delete', $invoice);

        $this->service->deleteInvoice($request->user() ?? auth()->user(), $invoice);

        return response()->json(['message' => 'Invoice deleted.']);
    }
}
