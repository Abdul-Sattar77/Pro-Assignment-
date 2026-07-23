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

import Link from "next/link";
import { ROUTES } from "@/constants/routes";

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
  href?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  href,
}: StatCardProps) {
  const CardContentWrapper = () => (
    <>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {title}
        </span>
        <div className="bg-sidebar-accent text-primary rounded-lg p-2">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-foreground font-mono text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </div>
        {(trend || description) && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={
                  trend.positive
                    ? "text-success flex items-center font-medium"
                    : "text-destructive flex items-center font-medium"
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
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline-hidden focus-visible:ring-ring rounded-xl focus-visible:ring-2"
      >
        <Card className={`${className} hover:bg-muted/30 transition-all cursor-pointer`}>
          <CardContentWrapper />
        </Card>
      </Link>
    );
  }

  return (
    <Card className={className}>
      <CardContentWrapper />
    </Card>
  );
}

import { useDashboardStats } from "@/features/dashboard";
import { formatCurrency } from "@/config/currency";

export function StatCards() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-card/50 h-28 rounded-xl border" />
        ))}
      </div>
    );
  }

  const latestInflow = data.trends?.inflows?.[data.trends.inflows.length - 1] ?? 0;
  const prevInflow = data.trends?.inflows?.[data.trends.inflows.length - 2] ?? 0;
  const trendPct = prevInflow > 0 ? (((latestInflow - prevInflow) / prevInflow) * 100).toFixed(1) : "0.0";
  const isPositive = parseFloat(trendPct) >= 0;

  const stats = [
    {
      title: "Revenue Overview",
      value: formatCurrency(data.stats.revenue),
      icon: DollarSign,
      trend: { value: `${isPositive ? "+" : ""}${trendPct}%`, positive: isPositive },
      description: "all-time verified",
      className: "border-primary/20 bg-primary/5",
      href: ROUTES.finance,
    },
    {
      title: "Net Profit Balance",
      value: formatCurrency(data.stats.profit),
      icon: TrendingUp,
      trend: { value: "Net Earnings", positive: true },
      description: "revenue minus payout",
      href: ROUTES.finance,
    },
    {
      title: "Active Assignments",
      value: data.stats.active_assignments,
      icon: FileText,
      trend: { value: "Active", positive: true },
      description: "current workload",
      href: `${ROUTES.assignments}?status=in_progress`,
    },
    {
      title: "Completed Assignments",
      value: data.stats.completed_assignments,
      icon: CheckCircle2,
      trend: { value: "Done", positive: true },
      description: "all-time complete",
      href: `${ROUTES.assignments}?status=completed`,
    },
    {
      title: "Pending Assignments",
      value: data.stats.pending_assignments,
      icon: Clock,
      trend: { value: "Awaiting Action", positive: true },
      description: "needs review",
      href: `${ROUTES.assignments}?status=pending`,
    },
    {
      title: "Due This Week",
      value: data.stats.due_assignments,
      icon: Calendar,
      trend: { value: "Timeline Alerts", positive: true },
      description: "due in 7 days",
      href: ROUTES.assignments,
    },
    {
      title: "Overdue Assignments",
      value: data.stats.overdue_assignments,
      icon: AlertTriangle,
      trend: { value: "Action Required", positive: false },
      description: "past deadline",
      className: "border-destructive/20 bg-destructive/5 text-destructive",
      href: `${ROUTES.assignments}?status=overdue`,
    },
    {
      title: "Total Clients",
      value: data.stats.total_clients,
      icon: Users,
      trend: { value: "Onboarded", positive: true },
      description: "registered clients",
      href: `${ROUTES.users}?role=client`,
    },
    {
      title: "Total Writers",
      value: data.stats.total_writers,
      icon: UserRound,
      trend: { value: "Vetted", positive: true },
      description: "vetted writers",
      href: `${ROUTES.users}?role=writer`,
    },
    {
      title: "Project Managers",
      value: data.stats.total_pms,
      icon: ShieldCheck,
      trend: { value: "Active", positive: true },
      description: "operational staff",
      href: `${ROUTES.users}?role=project_manager`,
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
