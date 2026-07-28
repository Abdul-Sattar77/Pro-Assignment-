<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreInvoiceRequest;
use App\Http\Requests\Finance\SubmitPaymentRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Assignment;
use App\Models\Invoice;
use App\Models\User;
use App\Notifications\PaymentReminderNotification;
use App\Services\Finance\InvoiceService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Invoice + payment endpoints. Thin: authorize → service → resource.
 */
final class InvoiceController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly InvoiceService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);
        $perPage = $request->query('per_page', '15');

        $paginator = $this->service->list(
            $this->actor($request),
            ['status' => is_string($filter['status'] ?? null) ? $filter['status'] : null],
            min(is_numeric($perPage) ? (int) $perPage : 15, 100),
        );

        return ApiResponse::collection(
            InvoiceResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Invoice::class);

        return ApiResponse::item($this->service->summary($this->actor($request)));
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        /** @var array{assignmentId?: string|null, clientId?: string|null, amount: float|string, currency?: string, description?: string|null} $validated */
        $validated = $request->validated();

        $assignmentId = null;
        $clientId = null;

        if (!empty($validated['assignmentId'])) {
            $assignment = Assignment::query()->where('uuid', $validated['assignmentId'])->firstOrFail();
            $assignmentId = (int) $assignment->getKey();
            $clientId = (int) $assignment->client_id;
        } elseif (!empty($validated['clientId'])) {
            $client = User::query()->where('uuid', $validated['clientId'])->firstOrFail();
            $clientId = (int) $client->getKey();
        }

        abort_if($clientId === null, 422);

        $invoice = $this->service->create(
            $this->actor($request),
            [
                'clientId' => $clientId,
                'amountCents' => (int) round(((float) $validated['amount']) * 100),
                'currency' => $validated['currency'] ?? 'USD',
                'description' => $validated['description'] ?? null,
            ],
            $assignmentId,
        );

        return ApiResponse::resource(InvoiceResource::make($invoice->load('client', 'assignment')), 201);
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('view', $invoice);

        return ApiResponse::resource(InvoiceResource::make($invoice->load('client', 'assignment')));
    }

    public function submitPayment(SubmitPaymentRequest $request, Invoice $invoice): JsonResponse
    {
        /** @var string $reference */
        $reference = $request->validated('reference');

        $updated = $this->service->submitPayment($this->actor($request), $invoice, $reference);

        return ApiResponse::resource(InvoiceResource::make($updated->load('client', 'assignment')));
    }

    public function verify(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('verify', $invoice);

        $updated = $this->service->verify($invoice);

        return ApiResponse::resource(InvoiceResource::make($updated->load('client', 'assignment')));
    }

    public function cancel(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('manage', Invoice::class);

        $updated = $this->service->cancel($invoice);

        return ApiResponse::resource(InvoiceResource::make($updated->load('client', 'assignment')));
    }

    /**
     * Send a payment reminder email + in-app notification to the invoice's client.
     * Only PM and Admin can trigger this (guarded by the 'manage' Invoice policy).
     */
    public function sendReminder(Request $request, Invoice $invoice): JsonResponse
    {
        $this->authorize('manage', Invoice::class);

        /** @var User $actor */
        $actor = $request->user();

        // Load the client relation if not already loaded
        $invoice->loadMissing('client');

        $client = $invoice->client;

        if ($client === null) {
            return ApiResponse::error('CLIENT_NOT_FOUND', 'No client associated with this invoice.', 422);
        }

        // Fire the notification — queued, so this returns immediately
        $client->notify(new PaymentReminderNotification($invoice, $actor->name));

        return ApiResponse::item([
            'sent'    => true,
            'message' => "Payment reminder sent to {$client->name}.",
        ]);
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
