<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\FinanceService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class FinanceController extends Controller
{
    public function __construct(
        private readonly FinanceService $service
    ) {}

    public function stats(Request $request): JsonResponse
    {
        // Finance dashboard statistics is restricted to Admin & PM roles
        if (!$request->user()?->hasAnyRole(['admin', 'project_manager'])) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to financial reports.', 403);
        }

        $stats = $this->service->getStats($request->user());

        // Transform recent payments using PaymentResource
        $stats['recentPayments'] = \App\Http\Resources\PaymentResource::collection($stats['recentPayments']);

        return ApiResponse::item($stats);
    }
}
