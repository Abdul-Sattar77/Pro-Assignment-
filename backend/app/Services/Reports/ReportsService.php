<?php

declare(strict_types=1);

namespace App\Services\Reports;

use App\Enums\AssignmentStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\Role;
use App\Models\Assignment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Carbon;

final class ReportsService
{
    /**
     * Get data for a report view (metrics + table rows).
     */
    public function getReportData(string $type, ?string $from = null, ?string $to = null): array
    {
        $startDate = $from ? Carbon::parse($from)->startOfDay() : null;
        $endDate = $to ? Carbon::parse($to)->endOfDay() : null;

        return match ($type) {
            'assignments' => $this->assignmentsReport($startDate, $endDate),
            'clients' => $this->clientsReport($startDate, $endDate),
            'writers' => $this->writersReport($startDate, $endDate),
            'pms' => $this->pmsReport($startDate, $endDate),
            'revenue' => $this->revenueReport($startDate, $endDate),
            'expenses' => $this->expensesReport($startDate, $endDate),
            'performance' => $this->performanceReport($startDate, $endDate),
            'profit' => $this->profitReport($startDate, $endDate),
            default => throw new \InvalidArgumentException("Invalid report type: {$type}"),
        };
    }

    /**
     * Generate a CSV string of the report.
     */
    public function exportToCsv(string $type, ?string $from = null, ?string $to = null): string
    {
        $data = $this->getReportData($type, $from, $to);
        $headers = $data['headers'];
        $rows = $data['rows'];

        $output = fopen('php://temp', 'r+');
        if ($output === false) {
            return '';
        }

        // Add UTF-8 BOM for proper Excel compatibility
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        fputcsv($output, $headers);

        foreach ($rows as $row) {
            // Flatten row values to simple strings for CSV representation
            $csvRow = array_map(function ($val) {
                if (is_bool($val)) {
                    return $val ? 'Yes' : 'No';
                }

                return (string) ($val ?? '');
            }, array_values($row));

            fputcsv($output, $csvRow);
        }

        rewind($output);
        $csvString = stream_get_contents($output);
        fclose($output);

        return $csvString ?: '';
    }

    /**
     * Generate an Excel XML string of the report.
     */
    public function exportToExcel(string $type, ?string $from = null, ?string $to = null): string
    {
        $data = $this->getReportData($type, $from, $to);
        $headers = $data['headers'];
        $rows = $data['rows'];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<?mso-application progid="Excel.Sheet"?>' . "\n";
        $xml .= '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"' . "\n";
        $xml .= ' xmlns:o="urn:schemas-microsoft-com:office:office"' . "\n";
        $xml .= ' xmlns:x="urn:schemas-microsoft-com:office:excel"' . "\n";
        $xml .= ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' . "\n";
        $xml .= ' <Worksheet ss:Name="' . ucfirst($type) . ' Report">' . "\n";
        $xml .= '  <Table>' . "\n";

        // Header row
        $xml .= '   <Row>' . "\n";
        foreach ($headers as $header) {
            $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars((string) $header) . '</Data></Cell>' . "\n";
        }
        $xml .= '   </Row>' . "\n";

        // Data rows
        foreach ($rows as $row) {
            $xml .= '   <Row>' . "\n";
            foreach (array_values($row) as $val) {
                $display = is_bool($val) ? ($val ? 'Yes' : 'No') : (string) ($val ?? '');
                $xml .= '    <Cell><Data ss:Type="String">' . htmlspecialchars($display) . '</Data></Cell>' . "\n";
            }
            $xml .= '   </Row>' . "\n";
        }

        $xml .= '  </Table>' . "\n";
        $xml .= ' </Worksheet>' . "\n";
        $xml .= '</Workbook>';

        return $xml;
    }

    /**
     * Generate a print-ready HTML/PDF string of the report.
     */
    public function exportToPdf(string $type, ?string $from = null, ?string $to = null): string
    {
        $data = $this->getReportData($type, $from, $to);
        $headers = $data['headers'];
        $rows = $data['rows'];
        $metrics = $data['metrics'];

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8">';
        $html .= '<title>' . ucfirst($type) . ' Report</title>';
        $html .= '<style>
            body { font-family: sans-serif; margin: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            .metrics { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
            .metric-card { border: 1px solid #ccc; padding: 10px; border-radius: 6px; flex: 1; min-width: 150px; }
            .metric-label { font-size: 11px; text-transform: uppercase; color: #666; }
            .metric-val { font-size: 16px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print { body { margin: 0; } }
        </style></head><body>';
        $html .= '<h1>' . ucfirst($type) . ' Report</h1>';
        $html .= '<p style="font-size: 12px; color: #666;">Generated on ' . now()->toDayDateTimeString() . '</p>';

        $html .= '<div class="metrics">';
        foreach ($metrics as $m) {
            $html .= '<div class="metric-card"><div class="metric-label">' . htmlspecialchars((string) $m['label']) . '</div><div class="metric-val">' . htmlspecialchars((string) $m['value']) . '</div></div>';
        }
        $html .= '</div>';

        $html .= '<table><thead><tr>';
        foreach ($headers as $h) {
            $html .= '<th>' . htmlspecialchars((string) $h) . '</th>';
        }
        $html .= '</tr></thead><tbody>';

        foreach ($rows as $row) {
            $html .= '<tr>';
            foreach (array_values($row) as $val) {
                $display = is_bool($val) ? ($val ? 'Yes' : 'No') : (string) ($val ?? '');
                $html .= '<td>' . htmlspecialchars($display) . '</td>';
            }
            $html .= '</tr>';
        }

        $html .= 'tbody></table>';
        $html .= '<script>window.onload = function() { window.print(); };</script>';
        $html .= '</body></html>';

        return $html;
    }

    private function currencyPrefix(): string
    {
        return config('finance.currency', 'PKR') . ' ';
    }

    private function resolveAssignmentFinancials(Assignment $a): array
    {
        $price = (float) ($a->client_price ?? 0.0);
        if ($price <= 0.0) {
            $invoiceSum = (float) ($a->invoices->sum('amount_cents') / 100);
            if ($invoiceSum > 0.0) {
                $price = $invoiceSum;
            } else {
                $paymentSum = (float) $a->payments
                    ->where('status', PaymentStatus::Verified)
                    ->whereIn('payment_type', [PaymentType::Advance, PaymentType::Partial, PaymentType::Balance])
                    ->sum('amount');
                if ($paymentSum > 0.0) {
                    $price = $paymentSum;
                }
            }
        }

        $cost = (float) ($a->writer_cost ?? 0.0);
        if ($cost <= 0.0) {
            $payoutSum = (float) $a->payments
                ->where('status', PaymentStatus::Verified)
                ->where('payment_type', PaymentType::WriterPayout)
                ->sum('amount');
            if ($payoutSum > 0.0) {
                $cost = $payoutSum;
            }
        }

        $discount = (float) ($a->discount ?? 0.0);
        $profit = ($price - $discount) - $cost;

        return [
            'price' => $price,
            'cost' => $cost,
            'discount' => $discount,
            'profit' => $profit,
        ];
    }

    private function assignmentsReport(?Carbon $from, ?Carbon $to): array
    {
        $query = Assignment::query()->with(['client', 'writer', 'projectManager', 'invoices', 'payments']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $assignments = $query->orderBy('created_at', 'desc')->get();

        $totalCount = $assignments->count();
        $totalRevenue = 0.0;
        $totalCost = 0.0;
        $totalProfit = 0.0;

        $statusSummary = [];
        foreach (AssignmentStatus::cases() as $status) {
            $statusSummary[$status->value] = $assignments->where('status', $status)->count();
        }

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Assignment ID', 'Title', 'Subject', 'Client Name', 'PM Name',
            'Writer Name', 'Status', 'Priority', 'Word Count',
            "Client Price ({$curr})", "Writer Cost ({$curr})", "Net Profit ({$curr})",
            'Deadline', 'Created At',
        ];

        $rows = [];
        foreach ($assignments as $a) {
            $fin = $this->resolveAssignmentFinancials($a);
            $totalRevenue += $fin['price'];
            $totalCost += $fin['cost'];
            $totalProfit += $fin['profit'];

            $rows[] = [
                'id' => $a->uuid,
                'title' => $a->title,
                'subject' => $a->subject,
                'client_name' => $a->client?->name,
                'pm_name' => $a->projectManager?->name,
                'writer_name' => $a->writer?->name,
                'status' => $a->status->label(),
                'priority' => $a->priority->label(),
                'word_count' => $a->word_count,
                'client_price' => $fin['price'],
                'writer_cost' => $fin['cost'],
                'net_profit' => $fin['profit'],
                'deadline' => $a->deadline->toIso8601String(),
                'created_at' => $a->created_at?->toIso8601String(),
            ];
        }

        return [
            'metrics' => [
                ['label' => 'Total Assignments', 'value' => $totalCount],
                ['label' => 'Total Value', 'value' => $this->currencyPrefix() . number_format($totalRevenue)],
                ['label' => 'Total Cost', 'value' => $this->currencyPrefix() . number_format($totalCost)],
                ['label' => 'Projected Net Profit', 'value' => $this->currencyPrefix() . number_format($totalProfit)],
            ],
            'statusSummary' => $statusSummary,
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function clientsReport(?Carbon $from, ?Carbon $to): array
    {
        $query = User::role(Role::Client->value)->with(['roles']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $clients = $query->get();

        $rows = [];
        foreach ($clients as $client) {
            // Count total and active orders
            $assignments = Assignment::query()->where('client_id', $client->id)->get();
            $totalOrders = $assignments->count();
            $activeOrders = $assignments->whereIn('status', [
                AssignmentStatus::PendingAssignment,
                AssignmentStatus::Assigned,
                AssignmentStatus::InProgress,
                AssignmentStatus::Submitted,
                AssignmentStatus::Delivered,
                AssignmentStatus::RevisionRequested,
            ])->count();

            // Sum client prices
            $totalInflow = Payment::query()
                ->where('user_id', $client->id)
                ->where('status', PaymentStatus::Verified->value)
                ->whereIn('payment_type', [
                    PaymentType::Advance->value,
                    PaymentType::Partial->value,
                    PaymentType::Balance->value,
                ])
                ->sum('amount');

            $rows[] = [
                'id' => $client->uuid,
                'name' => $client->name,
                'email' => $client->email,
                'total_orders' => $totalOrders,
                'total_paid' => (float) $totalInflow,
                'active_orders' => $activeOrders,
                'registered_at' => $client->created_at?->toIso8601String(),
            ];
        }

        // Sort by total orders descending
        usort($rows, fn ($a, $b) => $b['total_orders'] <=> $a['total_orders']);

        $totalClients = $clients->count();
        $activeClients = count(array_filter($rows, fn ($r) => $r['active_orders'] > 0));
        $totalRevenue = array_sum(array_column($rows, 'total_paid'));

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Client ID', 'Client Name', 'Client Email', 'Total Orders',
            "Total Paid Inflow ({$curr})", 'Active Orders', 'Registered At',
        ];

        return [
            'metrics' => [
                ['label' => 'Total Clients', 'value' => $totalClients],
                ['label' => 'Clients with Active Orders', 'value' => $activeClients],
                ['label' => 'Total Received Revenue', 'value' => $this->currencyPrefix() . number_format($totalRevenue)],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function writersReport(?Carbon $from, ?Carbon $to): array
    {
        $query = User::role(Role::Writer->value)->with(['roles']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $writers = $query->get();

        $rows = [];
        foreach ($writers as $writer) {
            $assignments = Assignment::query()->where('writer_id', $writer->id)->get();
            $workload = $assignments->whereIn('status', [
                AssignmentStatus::Assigned,
                AssignmentStatus::InProgress,
                AssignmentStatus::RevisionRequested,
            ])->count();
            $completed = $assignments->where('status', AssignmentStatus::Completed)->count();

            // Writer total payouts
            $earnings = Payment::query()
                ->where('user_id', $writer->id)
                ->where('payment_type', PaymentType::WriterPayout->value)
                ->where('status', PaymentStatus::Verified->value)
                ->sum('amount');

            $rows[] = [
                'id' => $writer->uuid,
                'name' => $writer->name,
                'email' => $writer->email,
                'workload' => $workload,
                'completed' => $completed,
                'total_earnings' => (float) $earnings,
                'registered_at' => $writer->created_at?->toIso8601String(),
            ];
        }

        // Sort by workload desc
        usort($rows, fn ($a, $b) => $b['workload'] <=> $a['workload']);

        $totalWriters = $writers->count();
        $totalCompleted = array_sum(array_column($rows, 'completed'));
        $totalPaid = array_sum(array_column($rows, 'total_earnings'));

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Writer ID', 'Writer Name', 'Writer Email', 'Current Workload',
            'Completed Orders', "Total Earnings ({$curr})", 'Registered At',
        ];

        return [
            'metrics' => [
                ['label' => 'Total Writers', 'value' => $totalWriters],
                ['label' => 'Total Completed Assignments', 'value' => $totalCompleted],
                ['label' => 'Total Writer Earnings Paid', 'value' => $this->currencyPrefix() . number_format($totalPaid)],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function pmsReport(?Carbon $from, ?Carbon $to): array
    {
        $query = User::role(Role::ProjectManager->value)->with(['roles']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $pms = $query->get();

        $rows = [];
        foreach ($pms as $pm) {
            $assignments = Assignment::query()->where('project_manager_id', $pm->id)->get();
            $workload = $assignments->whereIn('status', [
                AssignmentStatus::Assigned,
                AssignmentStatus::InProgress,
                AssignmentStatus::Submitted,
                AssignmentStatus::Delivered,
                AssignmentStatus::RevisionRequested,
            ])->count();
            $completed = $assignments->where('status', AssignmentStatus::Completed)->count();

            $rows[] = [
                'id' => $pm->uuid,
                'name' => $pm->name,
                'email' => $pm->email,
                'total_managed' => $assignments->count(),
                'completed' => $completed,
                'workload' => $workload,
                'registered_at' => $pm->created_at?->toIso8601String(),
            ];
        }

        // Sort by managed desc
        usort($rows, fn ($a, $b) => $b['total_managed'] <=> $a['total_managed']);

        $totalPms = $pms->count();
        $totalManaged = array_sum(array_column($rows, 'total_managed'));

        $headers = [
            'PM ID', 'PM Name', 'PM Email', 'Managed Orders',
            'Completed Orders', 'Active Workload', 'Registered At',
        ];

        return [
            'metrics' => [
                ['label' => 'Total Project Managers', 'value' => $totalPms],
                ['label' => 'Total Assignments Managed', 'value' => $totalManaged],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function revenueReport(?Carbon $from, ?Carbon $to): array
    {
        $query = Payment::query()->with(['assignment', 'user', 'verifiedBy'])
            ->whereIn('payment_type', [
                PaymentType::Advance->value,
                PaymentType::Partial->value,
                PaymentType::Balance->value,
            ]);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $totalCount = $payments->count();
        $verifiedSum = $payments->where('status', PaymentStatus::Verified)->sum('amount');
        $pendingSum = $payments->where('status', PaymentStatus::Pending)->sum('amount');

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Transaction ID', 'Date', 'Client Name', 'Payment Method',
            'Payment Type', "Amount ({$curr})", 'Status', 'Notes',
        ];

        $rows = [];
        foreach ($payments as $p) {
            $rows[] = [
                'id' => $p->uuid,
                'date' => $p->created_at?->toIso8601String(),
                'client_name' => $p->user?->name,
                'method' => str_replace('_', ' ', $p->payment_method),
                'type' => $p->payment_type->label(),
                'amount' => (float) $p->amount,
                'status' => $p->status->label(),
                'notes' => $p->notes,
            ];
        }

        return [
            'metrics' => [
                ['label' => 'Total Revenue Payments', 'value' => $totalCount],
                ['label' => 'Verified Inflow Revenue', 'value' => $this->currencyPrefix() . number_format($verifiedSum)],
                ['label' => 'Pending Verification Inflow', 'value' => $this->currencyPrefix() . number_format($pendingSum)],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function expensesReport(?Carbon $from, ?Carbon $to): array
    {
        $query = Payment::query()->with(['assignment', 'user', 'verifiedBy'])
            ->whereIn('payment_type', [
                PaymentType::WriterPayout->value,
                PaymentType::Expense->value,
            ]);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        $totalCount = $payments->count();
        $verifiedSum = $payments->where('status', PaymentStatus::Verified)->sum('amount');
        $payoutsSum = $payments->where('payment_type', PaymentType::WriterPayout)
            ->where('status', PaymentStatus::Verified)->sum('amount');
        $expensesSum = $payments->where('payment_type', PaymentType::Expense)
            ->where('status', PaymentStatus::Verified)->sum('amount');

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Transaction ID', 'Date', 'Payee/Vendor', 'Payment Method',
            'Payment Type', "Amount ({$curr})", 'Status', 'Notes',
        ];

        $rows = [];
        foreach ($payments as $p) {
            $rows[] = [
                'id' => $p->uuid,
                'date' => $p->created_at?->toIso8601String(),
                'payee_name' => $p->user?->name ?? 'General Vendor',
                'method' => str_replace('_', ' ', $p->payment_method),
                'type' => $p->payment_type->label(),
                'amount' => (float) $p->amount,
                'status' => $p->status->label(),
                'notes' => $p->notes,
            ];
        }

        return [
            'metrics' => [
                ['label' => 'Total Outflow Payments', 'value' => $totalCount],
                ['label' => 'Verified Outflow Cost', 'value' => $this->currencyPrefix() . number_format($verifiedSum)],
                ['label' => 'Writer Payouts (Verified)', 'value' => $this->currencyPrefix() . number_format($payoutsSum)],
                ['label' => 'General Expenses (Verified)', 'value' => $this->currencyPrefix() . number_format($expensesSum)],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function performanceReport(?Carbon $from, ?Carbon $to): array
    {
        $query = User::role(Role::Writer->value)->with(['roles']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $writers = $query->get();

        $rows = [];
        foreach ($writers as $writer) {
            $assignments = Assignment::query()->where('writer_id', $writer->id)->get();
            $totalCount = $assignments->count();
            $workload = $assignments->whereIn('status', [
                AssignmentStatus::Assigned,
                AssignmentStatus::InProgress,
                AssignmentStatus::RevisionRequested,
            ])->count();
            $completed = $assignments->where('status', AssignmentStatus::Completed)->count();

            // Timeliness calculations
            $onTime = 0;
            $late = 0;
            foreach ($assignments->where('status', AssignmentStatus::Completed) as $a) {
                if ($a->updated_at <= $a->deadline) {
                    $onTime++;
                } else {
                    $late++;
                }
            }

            $rate = $completed > 0 ? round(($onTime / $completed) * 100, 1) : 100;

            $rows[] = [
                'name' => $writer->name,
                'email' => $writer->email,
                'total_assignments' => $totalCount,
                'workload' => $workload,
                'completed' => $completed,
                'on_time' => $onTime,
                'late' => $late,
                'on_time_rate' => $rate,
            ];
        }

        // Sort by on_time_rate desc
        usort($rows, fn ($a, $b) => $b['on_time_rate'] <=> $a['on_time_rate']);

        $totalWriters = $writers->count();
        $overallCompleted = array_sum(array_column($rows, 'completed'));
        $overallOnTime = array_sum(array_column($rows, 'on_time'));
        $overallOnTimeRate = $overallCompleted > 0 ? round(($overallOnTime / $overallCompleted) * 100, 1) : 100;

        $headers = [
            'Writer Name', 'Writer Email', 'Total Assignments', 'Workload (Active)',
            'Completed', 'Completed On Time', 'Completed Late', 'On-Time Rate (%)',
        ];

        return [
            'metrics' => [
                ['label' => 'Total Writers Evaluated', 'value' => $totalWriters],
                ['label' => 'Total Assignments Completed', 'value' => $overallCompleted],
                ['label' => 'Overall On-Time Completion Rate', 'value' => "{$overallOnTimeRate}%"],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function profitReport(?Carbon $from, ?Carbon $to): array
    {
        $query = Assignment::query()->with(['client', 'writer', 'projectManager', 'invoices', 'payments']);

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }

        $assignments = $query->orderBy('created_at', 'desc')->get();

        $totalRevenue = 0.0;
        $totalCost = 0.0;
        $totalProfit = 0.0;

        $curr = config('finance.currency', 'PKR');
        $headers = [
            'Assignment ID', 'Title', 'Client Name', 'Writer Name',
            "Client Price ({$curr})", "Discount ({$curr})", "Writer Cost ({$curr})",
            "Net Profit ({$curr})", 'Profit Margin (%)', 'Status', 'Created At',
        ];

        $rows = [];
        foreach ($assignments as $a) {
            $fin = $this->resolveAssignmentFinancials($a);
            $rev = $fin['price'] - $fin['discount'];
            $margin = $rev > 0 ? round(($fin['profit'] / $rev) * 100, 2) : 0.0;

            $totalRevenue += $rev;
            $totalCost += $fin['cost'];
            $totalProfit += $fin['profit'];

            $rows[] = [
                'id' => $a->uuid,
                'title' => $a->title,
                'client_name' => $a->client?->name,
                'writer_name' => $a->writer?->name,
                'client_price' => $fin['price'],
                'discount' => $fin['discount'],
                'writer_cost' => $fin['cost'],
                'net_profit' => $fin['profit'],
                'profit_margin' => $margin,
                'status' => $a->status->label(),
                'created_at' => $a->created_at?->toIso8601String(),
            ];
        }

        $averageMargin = $totalRevenue > 0 ? round(($totalProfit / $totalRevenue) * 100, 2) : 0.0;

        return [
            'metrics' => [
                ['label' => 'Total Gross Revenue', 'value' => $this->currencyPrefix() . number_format($totalRevenue)],
                ['label' => 'Total Cost & Outflows', 'value' => $this->currencyPrefix() . number_format($totalCost)],
                ['label' => 'Total Net Profit', 'value' => $this->currencyPrefix() . number_format($totalProfit)],
                ['label' => 'Average Profit Margin', 'value' => $averageMargin.'%'],
            ],
            'headers' => $headers,
            'rows' => $rows,
        ];
    }
}
