<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class ReportsController extends Controller
{
    public function __construct(
        private readonly ReportsService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()?->can('reports.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view reports.', 403);
        }

        $request->validate([
            'type' => ['required', 'string', 'in:assignments,clients,writers,pms,revenue,expenses,performance,profit'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $type = (string) $request->query('type');
        $from = $request->query('from') ? (string) $request->query('from') : null;
        $to = $request->query('to') ? (string) $request->query('to') : null;

        $data = $this->service->getReportData($type, $from, $to);

        return ApiResponse::item($data);
    }

    public function export(Request $request): Response|JsonResponse
    {
        if (!$request->user()?->can('reports.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view reports.', 403);
        }

        $request->validate([
            'type' => ['required', 'string', 'in:assignments,clients,writers,pms,revenue,expenses,performance,profit'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $type = (string) $request->query('type');
        $from = $request->query('from') ? (string) $request->query('from') : null;
        $to = $request->query('to') ? (string) $request->query('to') : null;

        $csv = $this->service->exportToCsv($type, $from, $to);
        $filename = $type.'-report-'.now()->format('Ymd-His').'.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
