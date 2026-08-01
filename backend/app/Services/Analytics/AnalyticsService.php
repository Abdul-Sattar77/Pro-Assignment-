<?php

declare(strict_types=1);

namespace App\Services\Analytics;

use App\Enums\AssignmentStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Payment;
use App\Models\User;
use App\Support\Sql;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class AnalyticsService
{
    /**
     * Compute and gather all KPI metrics and chart datasets for the dashboard.
     */
    public function getAnalyticsData(): array
    {
        // 1. KPI Calculations
        $totalClients = User::role(Role::Client->value)->count();
        $totalWriters = User::role(Role::Writer->value)->count();

        $activeAssignments = Assignment::query()
            ->whereNotIn('status', [AssignmentStatus::Completed->value, AssignmentStatus::Cancelled->value])
            ->count();

        $completedAssignments = Assignment::query()
            ->where('status', AssignmentStatus::Completed->value)
            ->count();

        $pendingAssignments = Assignment::query()
            ->where('status', AssignmentStatus::PendingAssignment->value)
            ->count();

        $revenueOverview = Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->sum('amount');

        // Due Assignments (active, deadline in next 7 days)
        $dueAssignments = Assignment::query()
            ->whereNotIn('status', [AssignmentStatus::Completed->value, AssignmentStatus::Cancelled->value])
            ->whereBetween('deadline', [Carbon::now(), Carbon::now()->addDays(7)])
            ->count();

        // Overdue Assignments (active, deadline in the past)
        $overdueAssignments = Assignment::query()
            ->whereNotIn('status', [AssignmentStatus::Completed->value, AssignmentStatus::Cancelled->value])
            ->where('deadline', '<', Carbon::now())
            ->count();

        // Monthly Growth (percentage change in verified revenue this month vs last month)
        $thisMonthStart = Carbon::now()->startOfMonth();
        $thisMonthEnd = Carbon::now()->endOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $thisMonthRevenue = Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->whereBetween('created_at', [$thisMonthStart, $thisMonthEnd])
            ->sum('amount');

        $lastMonthRevenue = Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $thisMonthRevenue = (float) $thisMonthRevenue;
        $lastMonthRevenue = (float) $lastMonthRevenue;

        if ($lastMonthRevenue > 0) {
            $monthlyGrowth = round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 2);
        } else {
            $monthlyGrowth = $thisMonthRevenue > 0 ? 100.0 : 0.0;
        }

        // 2. Chart Datasets
        // Past 6 Months
        $past6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $past6Months[] = Carbon::now()->subMonths($i)->format('Y-m');
        }

        // Assignment Trends
        $assignmentTrendsQuery = DB::table('assignments')
            ->select(
                DB::raw(Sql::yearMonth().' as month'),
                DB::raw('COUNT(*) as count'),
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->whereNull('deleted_at')
            ->groupBy(DB::raw(Sql::yearMonth()))
            ->get();

        $assignmentTrends = [];
        foreach ($past6Months as $month) {
            $match = $assignmentTrendsQuery->firstWhere('month', $month);
            $assignmentTrends[] = [
                'month' => $month,
                'count' => $match ? (int) $match->count : 0,
            ];
        }

        // Revenue Trends
        $revenueTrendsQuery = DB::table('payments')
            ->select(
                DB::raw(Sql::yearMonth().' as month'),
                DB::raw('SUM(amount) as total'),
            )
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ])
            ->where('created_at', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->whereNull('deleted_at')
            ->groupBy(DB::raw(Sql::yearMonth()))
            ->get();

        $revenueTrends = [];
        foreach ($past6Months as $month) {
            $match = $revenueTrendsQuery->firstWhere('month', $month);
            $revenueTrends[] = [
                'month' => $month,
                'total' => $match ? (float) $match->total : 0.0,
            ];
        }

        // Writer Performance (Top 5 completed assignments)
        $writerPerformanceQuery = User::role(Role::Writer->value)
            ->select('users.name', 'users.email')
            ->selectRaw('COUNT(assignments.id) as completed_count')
            ->join('assignments', 'assignments.writer_id', '=', 'users.id')
            ->where('assignments.status', AssignmentStatus::Completed->value)
            ->whereNull('assignments.deleted_at')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('completed_count', 'desc')
            ->limit(5)
            ->get();

        $writerPerformance = [];
        foreach ($writerPerformanceQuery as $row) {
            $writerPerformance[] = [
                'name' => $row->name,
                'email' => $row->email,
                'completedCount' => (int) $row->completed_count,
            ];
        }

        // Client Activity (Top 5 assignment creators)
        $clientActivityQuery = User::role(Role::Client->value)
            ->select('users.name', 'users.email')
            ->selectRaw('COUNT(assignments.id) as order_count')
            ->join('assignments', 'assignments.client_id', '=', 'users.id')
            ->whereNull('assignments.deleted_at')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('order_count', 'desc')
            ->limit(5)
            ->get();

        $clientActivity = [];
        foreach ($clientActivityQuery as $row) {
            $clientActivity[] = [
                'name' => $row->name,
                'email' => $row->email,
                'orderCount' => (int) $row->order_count,
            ];
        }

        return [
            'kpis' => [
                'totalClients' => $totalClients,
                'totalWriters' => $totalWriters,
                'activeAssignments' => $activeAssignments,
                'completedAssignments' => $completedAssignments,
                'pendingAssignments' => $pendingAssignments,
                'revenueOverview' => (float) $revenueOverview,
                'monthlyGrowth' => $monthlyGrowth,
                'dueAssignments' => $dueAssignments,
                'overdueAssignments' => $overdueAssignments,
            ],
            'charts' => [
                'assignmentTrends' => $assignmentTrends,
                'revenueTrends' => $revenueTrends,
                'writerPerformance' => $writerPerformance,
                'clientActivity' => $clientActivity,
            ],
        ];
    }
}
