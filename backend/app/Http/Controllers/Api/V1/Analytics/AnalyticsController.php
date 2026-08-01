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
        $actor = $request->user();

        // Access is governed solely by the analytics.view permission (granted to
        // admin + PM in the seeder). No hardcoded role bypass, so revoking the
        // permission from a role actually takes effect — and prevents org-wide
        // financials leaking to a role that had the permission removed.
        if (!$actor?->can('analytics.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view analytics dashboards.', 403);
        }

        $data = $this->service->getAnalyticsData();

        return ApiResponse::item($data);
    }
}
