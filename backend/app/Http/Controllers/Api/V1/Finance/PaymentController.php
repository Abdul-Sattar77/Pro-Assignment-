<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Http\Requests\Finance\VerifyPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\FileRepositoryInterface;
use App\Repositories\Contracts\InvoiceRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Finance\FinanceService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly FinanceService $service,
        private readonly PaymentRepositoryInterface $payments,
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly InvoiceRepositoryInterface $invoices,
        private readonly UserRepositoryInterface $users,
        private readonly FileRepositoryInterface $files
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        // Resolve relations uuids -> IDs
        $assignmentId = null;
        if (is_string($filter['assignmentId'] ?? null)) {
            $assignment = $this->assignments->findByUuid($filter['assignmentId']);
            $assignmentId = $assignment?->id;
        }

        $invoiceId = null;
        if (is_string($filter['invoiceId'] ?? null)) {
            $invoice = $this->invoices->findByUuid($filter['invoiceId']);
            $invoiceId = $invoice?->id;
        }

        $userId = null;
        if (is_string($filter['userId'] ?? null)) {
            $user = $this->users->findByUuid($filter['userId']);
            $userId = $user?->id;
        }

        $paginator = $this->payments->paginateFor(
            $request->user(),
            [
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
                'payment_type' => is_string($filter['paymentType'] ?? null) ? $filter['paymentType'] : null,
                'assignment_id' => $assignmentId,
                'invoice_id' => $invoiceId,
                'user_id' => $userId,
            ],
            is_string($sort) ? $sort : '-created_at',
            min(is_numeric($perPage) ? (int) $perPage : 15, 100)
        );

        return ApiResponse::collection(
            PaymentResource::collection($paginator->getCollection()),
            $paginator
        );
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        /** @var array{assignmentId?: string|null, invoiceId?: string|null, userId?: string|null, amount: float, paymentMethod?: string|null, paymentType: string, proofFileId?: string|null, verified?: bool|null, notes?: string|null} $data */
        $data = $request->validated();

        $assignmentId = null;
        if (isset($data['assignmentId'])) {
            $assignment = $this->assignments->findByUuid($data['assignmentId']);
            $assignmentId = $assignment?->id;
        }

        $invoiceId = null;
        if (isset($data['invoiceId'])) {
            $invoice = $this->invoices->findByUuid($data['invoiceId']);
            $invoiceId = $invoice?->id;
        }

        $userId = null;
        if (isset($data['userId'])) {
            $user = $this->users->findByUuid($data['userId']);
            $userId = $user?->id;
        }

        $proofFileId = null;
        if (isset($data['proofFileId'])) {
            $file = $this->files->findByUuid($data['proofFileId']);
            $proofFileId = $file?->id;
        }

        $payment = $this->service->recordPayment($request->user(), [
            'assignment_id' => $assignmentId,
            'invoice_id' => $invoiceId,
            'user_id' => $userId,
            'amount' => $data['amount'],
            'payment_method' => $data['paymentMethod'] ?? 'bank_transfer',
            'payment_type' => $data['paymentType'],
            'proof_file_id' => $proofFileId,
            'verified' => $data['verified'] ?? false,
            'notes' => $data['notes'] ?? null,
        ]);

        return ApiResponse::resource(PaymentResource::make($payment->load(['assignment', 'invoice', 'user', 'proofFile'])), 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        return ApiResponse::resource(PaymentResource::make($payment->load(['assignment', 'invoice', 'user', 'proofFile', 'verifiedBy'])));
    }

    public function verify(VerifyPaymentRequest $request, Payment $payment): JsonResponse
    {
        /** @var array{status: string, notes?: string|null} $data */
        $data = $request->validated();

        $updated = $this->service->verifyPayment(
            $request->user(),
            $payment,
            $data['status'],
            $data['notes'] ?? null
        );

        return ApiResponse::resource(PaymentResource::make($updated->load(['assignment', 'invoice', 'user', 'proofFile', 'verifiedBy'])));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $this->authorize('delete', $payment);

        $this->service->deletePayment($request->user() ?? auth()->user(), $payment);

        return response()->json(['message' => 'Payment deleted.']);
    }
}
