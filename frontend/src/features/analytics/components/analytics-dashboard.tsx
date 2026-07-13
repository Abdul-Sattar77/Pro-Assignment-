"use client";

import { useAnalytics } from "../hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Users,
  UserCheck,
  FileText,
  FileCheck,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Award,
  Activity,
} from "lucide-react";

export function AnalyticsDashboard() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm font-medium">Aggregating dashboard analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
        <h3 className="font-semibold text-lg">Failed to load analytics data</h3>
        <p className="text-sm opacity-90 mt-1">
          {error?.message || "Verify your roles and backend connection."}
        </p>
      </div>
    );
  }

  const { kpis, charts } = data;

  const kpiList = [
    {
      label: "Total Clients",
      value: kpis.totalClients.toLocaleString(),
      icon: Users,
      colorClass: "text-blue-600 dark:text-blue-400",
      desc: "Registered client profiles",
    },
    {
      label: "Total Writers",
      value: kpis.totalWriters.toLocaleString(),
      icon: UserCheck,
      colorClass: "text-indigo-600 dark:text-indigo-400",
      desc: "Registered writer profiles",
    },
    {
      label: "Active Assignments",
      value: kpis.activeAssignments.toLocaleString(),
      icon: FileText,
      colorClass: "text-amber-600 dark:text-amber-400",
      desc: "Currently in queue/progress",
    },
    {
      label: "Completed Assignments",
      value: kpis.completedAssignments.toLocaleString(),
      icon: FileCheck,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      desc: "Total finalized orders",
    },
    {
      label: "Pending Assignments",
      value: kpis.pendingAssignments.toLocaleString(),
      icon: Clock,
      colorClass: "text-slate-600 dark:text-slate-400",
      desc: "Awaiting writer matching",
    },
    {
      label: "Revenue Overview",
      value: `PKR ${kpis.revenueOverview.toLocaleString()}`,
      icon: DollarSign,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      desc: "Total verified client deposits",
    },
    {
      label: "Monthly Revenue Growth",
      value: `${kpis.monthlyGrowth >= 0 ? "+" : ""}${kpis.monthlyGrowth}%`,
      icon: TrendingUp,
      colorClass: kpis.monthlyGrowth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      desc: "Inflow change vs last month",
    },
    {
      label: "Due in 7 Days",
      value: kpis.dueAssignments.toLocaleString(),
      icon: Clock,
      colorClass: "text-blue-600 dark:text-blue-400",
      desc: "Urgent active deadlines",
    },
    {
      label: "Overdue Assignments",
      value: kpis.overdueAssignments.toLocaleString(),
      icon: AlertTriangle,
      colorClass: kpis.overdueAssignments > 0 ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-slate-600 dark:text-slate-400",
      desc: "Active orders past deadline",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 9 KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="border shadow-xs hover:shadow-md transition-shadow duration-250">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.colorClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-550">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Trends grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Assignment Trends Bar chart */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-primary" />
              Assignment Volume Trends
            </CardTitle>
            <CardDescription>Number of new orders placed monthly over the past 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.assignmentTrends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No volume records found.</p>
            ) : (
              <div className="space-y-3.5 pt-2">
                {charts.assignmentTrends.map((row) => {
                  const maxCount = Math.max(...charts.assignmentTrends.map((r) => r.count)) || 1;
                  const percent = (row.count / maxCount) * 100;
                  return (
                    <div key={row.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-350">{row.month}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          {row.count} Orders
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trends Progress chart */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-primary" />
              Verified Inflow Revenue Trends
            </CardTitle>
            <CardDescription>Verified client payment deposits monthly (past 6 months).</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.revenueTrends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No revenue records found.</p>
            ) : (
              <div className="space-y-3.5 pt-2">
                {charts.revenueTrends.map((row) => {
                  const maxTotal = Math.max(...charts.revenueTrends.map((r) => r.total)) || 1;
                  const percent = (row.total / maxTotal) * 100;
                  return (
                    <div key={row.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-350">{row.month}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">
                          PKR {row.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lists for Writer performance & Client Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Writers completed list */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-primary" />
              Top Writers Performance
            </CardTitle>
            <CardDescription>Writers with the highest completed assignments tally.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Writer</TableHead>
                  <TableHead className="text-right">Completed Assignments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charts.writerPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      No completed writer assignments logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  charts.writerPerformance.map((writer, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{writer.name}</p>
                          <p className="text-[10px] text-muted-foreground">{writer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800 dark:text-slate-200">
                        {writer.completedCount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Clients Active list */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              Top Client Activity
            </CardTitle>
            <CardDescription>Clients who have placed the most orders on the portal.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Orders Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charts.clientActivity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      No client orders registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  charts.clientActivity.map((client, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{client.name}</p>
                          <p className="text-[10px] text-muted-foreground">{client.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800 dark:text-slate-200">
                        {client.orderCount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
