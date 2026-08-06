<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentReminderResource;
use App\Models\Invoice;
use App\Models\PaymentReminder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PaymentReminderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()?->hasAnyRole(['admin', 'project_manager'])) {
            return ApiResponse::error('FORBIDDEN', 'You do not have permission to view payment reminder history.', 403);
        }

        $reminders = PaymentReminder::query()
            ->with(['invoice', 'client'])
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::collection(
            PaymentReminderResource::collection($reminders->getCollection()),
            $reminders,
        );
    }

    public function trigger(Request $request, Invoice $invoice): JsonResponse
    {
        if (!$request->user()?->hasAnyRole(['admin', 'project_manager'])) {
            return ApiResponse::error('FORBIDDEN', 'You do not have permission to send payment reminders.', 403);
        }

        if ($invoice->status->value === 'paid') {
            return ApiResponse::error('INVALID_ACTION', 'Cannot send a payment reminder for an already paid invoice.', 422);
        }

        $reminder = PaymentReminder::create([
            'invoice_id' => $invoice->id,
            'client_id' => $invoice->client_id,
            'type' => 'manual',
            'status' => 'sent',
            'notes' => $request->input('notes', 'Manual payment reminder dispatched by staff.'),
            'sent_at' => now(),
        ]);

        return ApiResponse::resource(
            PaymentReminderResource::make($reminder->load(['invoice', 'client'])),
            201,
        );
    }
}
