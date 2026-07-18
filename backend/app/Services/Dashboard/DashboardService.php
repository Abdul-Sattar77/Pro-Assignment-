<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\AssignmentStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

final class DashboardService
{
    public function getAdminDashboardData(): array
    {
        $inflowTypes = [PaymentType::Advance->value, PaymentType::Partial->value, PaymentType::Balance->value];
        $outflowTypes = [PaymentType::WriterPayout->value, PaymentType::Expense->value];
        $done = AssignmentStatus::Completed->value;

        // ----------------------------------------------------------------
        // 1. Payment totals — 2 sum queries
        // ----------------------------------------------------------------
        $totalInflow = (float) Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', $inflowTypes)
            ->sum('amount');

        $totalOutflow = (float) Payment::query()
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', $outflowTypes)
            ->sum('amount');

        // ----------------------------------------------------------------
        // 2. Assignment counts — single aggregated query via DB::table
        //    (was 5 separate COUNT queries)
        // ----------------------------------------------------------------
        $now = now()->toDateTimeString();
        $week = now()->addDays(7)->toDateTimeString();

        $activeStatuses = implode("','", [
            AssignmentStatus::Assigned->value,
            AssignmentStatus::InProgress->value,
            AssignmentStatus::RevisionRequested->value,
        ]);
        $pendingStatuses = implode("','", [
            AssignmentStatus::PendingAssignment->value,
            AssignmentStatus::Submitted->value,
            AssignmentStatus::Delivered->value,
        ]);

        $counts = DB::table('assignments')
            ->whereNull('deleted_at')
            ->selectRaw("
                COUNT(*) AS total,
                SUM(CASE WHEN status IN ('{$activeStatuses}')  THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN status = '{$done}'               THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status IN ('{$pendingStatuses}') THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN deadline < '{$now}'  AND status <> '{$done}' THEN 1 ELSE 0 END) AS overdue,
                SUM(CASE WHEN deadline BETWEEN '{$now}' AND '{$week}' AND status <> '{$done}' THEN 1 ELSE 0 END) AS due_week
            ")
            ->first();

        // ----------------------------------------------------------------
        // 3. User counts — 3 Spatie role scopes
        // ----------------------------------------------------------------
        $totalClients = User::role(Role::Client->value)->count();
        $totalWriters = User::role(Role::Writer->value)->count();
        $totalPms = User::role(Role::ProjectManager->value)->count();

        // ----------------------------------------------------------------
        // 4. Recent Assignments — single eager-loaded query, limit 5
        // ----------------------------------------------------------------
        $recentAssignments = Assignment::query()
            ->with(['client:id,name', 'writer:id,name'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => 'ASG-'.$a->id,
                'name' => $a->title,
                'client' => $a->client?->name ?? 'None',
                'subject' => $a->subject,
                'priority' => $a->priority->value ?? 'medium',
                'status' => $a->status->value ?? 'pending',
                'deadline' => $a->deadline->toDateString(),
            ]);

        // ----------------------------------------------------------------
        // 5. Activity Feed — no causer eager load needed
        // ----------------------------------------------------------------
        $recentActivities = Activity::query()
            ->select(['id', 'log_name', 'description', 'created_at'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($act) {
                $icon = 'CheckCircle2';
                $iconBg = 'bg-success/10';
                $iconColor = 'text-success';

                if ($act->log_name === 'assignment') {
                    $icon = 'FileUp';
                    $iconBg = 'bg-primary/10';
                    $iconColor = 'text-primary';
                } elseif ($act->log_name === 'payment') {
                    $icon = 'ShieldCheck';
                    $iconBg = 'bg-primary/5';
                    $iconColor = 'text-primary';
                }

                return [
                    'id' => (string) $act->id,
                    'type' => $act->log_name,
                    'message' => $act->description,
                    'timestamp' => $act->created_at?->diffForHumans() ?? 'Just now',
                    'iconName' => $icon,
                    'iconBg' => $iconBg,
                    'iconColor' => $iconColor,
                ];
            });

        // ----------------------------------------------------------------
        // 6. Trends — 2 GROUP BY queries replacing 12 sequential queries
        // ----------------------------------------------------------------
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();

        $volumeByMonth = DB::table('assignments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', $sixMonthsAgo)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') AS ym, COUNT(*) AS total")
            ->groupByRaw("TO_CHAR(created_at, 'YYYY-MM')")
            ->pluck('total', 'ym');

        $inflowByMonth = DB::table('payments')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', $sixMonthsAgo)
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', $inflowTypes)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') AS ym, SUM(amount) AS total")
            ->groupByRaw("TO_CHAR(created_at, 'YYYY-MM')")
            ->pluck('total', 'ym');

        $months = [];
        $volumes = [];
        $inflows = [];

        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonths($i);
            $key = $m->format('Y-m');
            $months[] = $m->format('M');
            $volumes[] = (int) ($volumeByMonth[$key] ?? 0);
            $inflows[] = (float) ($inflowByMonth[$key] ?? 0.0);
        }

        // ----------------------------------------------------------------
        // 7. Top Writers — raw aggregated query, no N+1 accessor calls
        //    Uses DB::table directly since User has no hasMany assignments
        // ----------------------------------------------------------------
        $writerUserIds = User::role(Role::Writer->value)->limit(20)->pluck('id');

        // Completed assignments count per writer — one query
        $completedByWriter = DB::table('assignments')
            ->whereNull('deleted_at')
            ->where('status', $done)
            ->whereIn('writer_id', $writerUserIds)
            ->selectRaw('writer_id, COUNT(*) AS total')
            ->groupBy('writer_id')
            ->pluck('total', 'writer_id');

        // Avg ratings per writer — one query
        // writer_ratings has no deleted_at (no SoftDeletes)
        $avgRatings = DB::table('writer_ratings')
            ->whereIn('writer_id', $writerUserIds)
            ->selectRaw('writer_id, AVG(overall_rating) AS avg_rating')
            ->groupBy('writer_id')
            ->pluck('avg_rating', 'writer_id');

        $topWriters = User::role(Role::Writer->value)
            ->select(['id', 'name', 'is_active'])
            ->limit(20)
            ->get()
            ->map(fn ($u) => [
                'name' => $u->name,
                'assignments' => (int) ($completedByWriter[$u->id] ?? 0),
                'rating' => round((float) ($avgRatings[$u->id] ?? 5.0), 1),
                'status' => $u->is_active ? 'active' : 'inactive',
            ])
            ->sortByDesc('rating')
            ->take(4)
            ->values();

        // ----------------------------------------------------------------
        // 8. Client Activity — one GROUP BY spend lookup, no N+1
        // ----------------------------------------------------------------
        $clientUserIds = User::role(Role::Client->value)->limit(20)->pluck('id');

        // Active assignments count per client — one query
        $activeByClient = DB::table('assignments')
            ->whereNull('deleted_at')
            ->whereIn('status', [AssignmentStatus::Assigned->value, AssignmentStatus::InProgress->value])
            ->whereIn('client_id', $clientUserIds)
            ->selectRaw('client_id, COUNT(*) AS total')
            ->groupBy('client_id')
            ->pluck('total', 'client_id');

        // Total verified spend per client — one query
        $clientSpends = DB::table('payments')
            ->whereNull('deleted_at')
            ->where('status', PaymentStatus::Verified->value)
            ->whereIn('payment_type', $inflowTypes)
            ->whereIn('user_id', $clientUserIds)
            ->selectRaw('user_id, SUM(amount) AS total_spend')
            ->groupBy('user_id')
            ->pluck('total_spend', 'user_id');

        $clientActivity = User::role(Role::Client->value)
            ->select(['id', 'name', 'updated_at'])
            ->limit(20)
            ->get()
            ->map(fn ($u) => [
                'name' => $u->name,
                'active' => (int) ($activeByClient[$u->id] ?? 0),
                'spend' => 'PKR '.number_format((float) ($clientSpends[$u->id] ?? 0)),
                'lastActive' => $u->updated_at?->diffForHumans() ?? '—',
            ])
            ->sortByDesc('active')
            ->take(4)
            ->values();

        return [
            'stats' => [
                'revenue' => $totalInflow,
                'expenses' => $totalOutflow,
                'profit' => $totalInflow - $totalOutflow,
                'active_assignments' => (int) ($counts->active ?? 0),
                'completed_assignments' => (int) ($counts->completed ?? 0),
                'pending_assignments' => (int) ($counts->pending ?? 0),
                'overdue_assignments' => (int) ($counts->overdue ?? 0),
                'due_assignments' => (int) ($counts->due_week ?? 0),
                'total_clients' => $totalClients,
                'total_writers' => $totalWriters,
                'total_pms' => $totalPms,
            ],
            'recent_assignments' => $recentAssignments,
            'recent_activities' => $recentActivities,
            'trends' => [
                'months' => $months,
                'volumes' => $volumes,
                'inflows' => $inflows,
            ],
            'top_writers' => $topWriters,
            'client_activity' => $clientActivity,
        ];
    }
}
