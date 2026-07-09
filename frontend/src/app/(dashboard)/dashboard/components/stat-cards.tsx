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

export function StatCards() {
  const stats = [
    {
      title: "Revenue Overview",
      value: "$48,250",
      icon: DollarSign,
      trend: { value: "+8.2%", positive: true },
      description: "from last month",
      className: "border-primary/20 bg-primary/5",
    },
    {
      title: "Monthly Growth",
      value: "+14.2%",
      icon: TrendingUp,
      trend: { value: "+2.1%", positive: true },
      description: "onboarded users",
    },
    {
      title: "Active Assignments",
      value: "37",
      icon: FileText,
      trend: { value: "+14.5%", positive: true },
      description: "active briefs",
    },
    {
      title: "Completed Assignments",
      value: "892",
      icon: CheckCircle2,
      trend: { value: "+28%", positive: true },
      description: "all-time complete",
    },
    {
      title: "Pending Assignments",
      value: "12",
      icon: Clock,
      trend: { value: "-5.3%", positive: true },
      description: "awaiting review",
    },
    {
      title: "Due Assignments",
      value: "8",
      icon: Calendar,
      trend: { value: "5 today", positive: true },
      description: "due this week",
    },
    {
      title: "Overdue Assignments",
      value: "3",
      icon: AlertTriangle,
      trend: { value: "High Priority", positive: false },
      description: "action required",
      className: "border-destructive/20 bg-destructive/5 text-destructive",
    },
    {
      title: "Total Clients",
      value: "142",
      icon: Users,
      trend: { value: "+12.1%", positive: true },
      description: "onboarded clients",
    },
    {
      title: "Total Writers",
      value: "84",
      icon: UserRound,
      trend: { value: "+4.3%", positive: true },
      description: "vetted experts",
    },
    {
      title: "Total Project Managers",
      value: "18",
      icon: ShieldCheck,
      trend: { value: "Stable", positive: true },
      description: "active managers",
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
