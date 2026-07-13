"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeIn } from "@/animations/variants";
import {
  Users,
  UserRound,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    positive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {title}
        </span>
        <div className="rounded-lg bg-sidebar-accent p-2 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="font-mono text-2xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </div>
        {(trend || description) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend && (
              <span
                className={
                  trend.positive
                    ? "text-success font-medium flex items-center"
                    : "text-destructive font-medium flex items-center"
                }
              >
                {trend.positive ? (
                  <TrendingUp className="mr-0.5 size-3" />
                ) : (
                  <TrendingDown className="mr-0.5 size-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useDashboardStats } from "@/features/dashboard";

export function StatCards() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-card/50" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Revenue Overview",
      value: "PKR " + data.stats.revenue.toLocaleString(),
      icon: DollarSign,
      trend: { value: "+8.2%", positive: true },
      description: "all-time verified",
      className: "border-primary/20 bg-primary/5",
    },
    {
      title: "Net Profit Balance",
      value: "PKR " + data.stats.profit.toLocaleString(),
      icon: TrendingUp,
      trend: { value: "Net Earnings", positive: true },
      description: "revenue minus payout",
    },
    {
      title: "Active Assignments",
      value: data.stats.active_assignments,
      icon: FileText,
      trend: { value: "Active", positive: true },
      description: "current workload",
    },
    {
      title: "Completed Assignments",
      value: data.stats.completed_assignments,
      icon: CheckCircle2,
      trend: { value: "Done", positive: true },
      description: "all-time complete",
    },
    {
      title: "Pending Assignments",
      value: data.stats.pending_assignments,
      icon: Clock,
      trend: { value: "Awaiting Action", positive: true },
      description: "needs review",
    },
    {
      title: "Due This Week",
      value: data.stats.due_assignments,
      icon: Calendar,
      trend: { value: "Timeline Alerts", positive: true },
      description: "due in 7 days",
    },
    {
      title: "Overdue Assignments",
      value: data.stats.overdue_assignments,
      icon: AlertTriangle,
      trend: { value: "Action Required", positive: false },
      description: "past deadline",
      className: "border-destructive/20 bg-destructive/5 text-destructive",
    },
    {
      title: "Total Clients",
      value: data.stats.total_clients,
      icon: Users,
      trend: { value: "Onboarded", positive: true },
      description: "registered clients",
    },
    {
      title: "Total Writers",
      value: data.stats.total_writers,
      icon: UserRound,
      trend: { value: "Vetted", positive: true },
      description: "vetted writers",
    },
    {
      title: "Project Managers",
      value: data.stats.total_pms,
      icon: ShieldCheck,
      trend: { value: "Active", positive: true },
      description: "operational staff",
    },
  ];

  return (
    <motion.div
      variants={fadeIn}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </motion.div>
  );
}
