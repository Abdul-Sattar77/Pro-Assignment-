<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators have access to dashboard insights.', 403);
        }

        $data = $this->service->getAdminDashboardData();

        return ApiResponse::resource($data);
    }
}
