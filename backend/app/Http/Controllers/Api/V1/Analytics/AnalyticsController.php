<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\AnalyticsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AnalyticsController extends Controller
{
    public function __construct(
        private readonly AnalyticsService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()?->can('analytics.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view analytics dashboards.', 403);
        }

        $data = $this->service->getAnalyticsData();

        return ApiResponse::item($data);
    }
}
