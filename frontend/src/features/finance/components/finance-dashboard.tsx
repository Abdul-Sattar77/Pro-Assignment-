"use client";

import { useFinanceStats } from "../hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_META, PAYMENT_TYPE_META } from "../constants";
import { PAYMENT_STATUS, type Payment } from "../types";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet, ShieldAlert, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

interface FinanceDashboardProps {
  onTabChange: (tab: string) => void;
}

export function FinanceDashboard({ onTabChange }: FinanceDashboardProps) {
  const { data: stats, isLoading, error } = useFinanceStats();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm font-medium">Loading finance metrics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
        <ShieldAlert className="mx-auto mb-2 h-8 w-8" />
        <h3 className="font-semibold text-lg">Failed to load statistics</h3>
        <p className="text-sm opacity-90 mt-1">
          {error?.message || "Verify your roles and backend connection."}
        </p>
      </div>
    );
  }

  const {
    totalRevenue,
    totalExpenses,
    totalProfit,
    profitMargin,
    monthlyBreakdown,
    pendingVerificationCount,
    recentPayments,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">PKR {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Verified Client Inflow
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border bg-gradient-to-br from-rose-500/5 via-transparent to-transparent shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">PKR {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-rose-500" />
              Payouts & Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border bg-gradient-to-br from-blue-500/5 via-transparent to-transparent shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Profit
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">PKR {totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue minus Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border bg-gradient-to-br from-amber-500/5 via-transparent to-transparent shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profit Margin
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average margin percentage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Visual Monthly Performance Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Visual summary of revenue vs expenses over the past months.</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyBreakdown.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No monthly data found yet.
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyBreakdown.map((row) => {
                  const maxAmount = Math.max(
                    ...monthlyBreakdown.map((r) => Math.max(r.revenue, r.expenses))
                  ) || 1;
                  const revPercent = (row.revenue / maxAmount) * 100;
                  const expPercent = (row.expenses / maxAmount) * 100;

                  return (
                    <div key={row.month} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {row.month}
                        </span>
                        <span className="text-muted-foreground">
                          Rev: <strong className="text-slate-900 dark:text-slate-100">PKR {row.revenue.toLocaleString()}</strong> | Exp: <strong className="text-slate-900 dark:text-slate-100">PKR {row.expenses.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${revPercent}%` }}
                          />
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${expPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action / Alerts */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>Pending transaction proof verification checks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-6">
            <div className="text-5xl font-extrabold tracking-tight text-amber-500 mb-2">
              {pendingVerificationCount}
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Payments are waiting for manual proof approval.
            </p>
          </CardContent>
          <div className="p-6 pt-0 border-t">
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => onTabChange("payments")}
            >
              Go to Payments Queue
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest registered financial changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent payments logged.</p>
            ) : (
              recentPayments.map((payment: Payment) => (
                <div key={payment.id} className="flex items-center justify-between py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {payment.user?.name || "General Client"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{payment.createdAt ? format(new Date(payment.createdAt), "MMM dd, HH:mm") : "-"}</span>
                      <span>·</span>
                      <span className="capitalize">{payment.paymentMethod.replace("_", " ")}</span>
                      <span>·</span>
                      <Badge variant="outline" className={`py-0 px-1 text-[10px] ${PAYMENT_TYPE_META[payment.paymentType].badgeClass}`}>
                        {PAYMENT_TYPE_META[payment.paymentType].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">
                      PKR {payment.amount.toLocaleString()}
                    </span>
                    <Badge variant="outline" className={PAYMENT_STATUS_META[payment.status].badgeClass}>
                      {PAYMENT_STATUS_META[payment.status].label}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
