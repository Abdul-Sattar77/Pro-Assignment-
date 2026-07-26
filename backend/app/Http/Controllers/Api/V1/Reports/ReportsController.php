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

    public function meta(Request $request): JsonResponse
    {
        if (!$request->user()?->can('reports.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view reports.', 403);
        }

        return ApiResponse::collection($this->service->getReportsMeta());
    }

    public function export(Request $request): Response|JsonResponse
    {
        if (!$request->user()?->can('reports.view')) {
            return ApiResponse::error('FORBIDDEN', 'You do not have access to view reports.', 403);
        }

        $request->validate([
            'type' => ['required', 'string', 'in:assignments,clients,writers,pms,revenue,expenses,performance,profit'],
            'format' => ['nullable', 'string', 'in:csv,xlsx,excel,pdf'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $type = (string) $request->query('type');
        $format = (string) $request->query('format', 'csv');
        $from = $request->query('from') ? (string) $request->query('from') : null;
        $to = $request->query('to') ? (string) $request->query('to') : null;

        $timestamp = now()->format('Ymd-His');

        if ($format === 'xlsx' || $format === 'excel') {
            $xml = $this->service->exportToExcel($type, $from, $to);
            $filename = $type . '-report-' . $timestamp . '.xls';
            return response($xml, 200, [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
            ]);
        }

        if ($format === 'pdf') {
            $html = $this->service->exportToPdf($type, $from, $to);
            $filename = $type . '-report-' . $timestamp . '.html';
            return response($html, 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        }

        $csv = $this->service->exportToCsv($type, $from, $to);
        $filename = $type . '-report-' . $timestamp . '.csv';

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
