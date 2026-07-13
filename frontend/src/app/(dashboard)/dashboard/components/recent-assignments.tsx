"use client";

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
import { useDashboardStats } from "@/features/dashboard";
import { Clock, CheckCircle2, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

type AssignmentStatus = "in_progress" | "completed" | "pending" | "overdue";
type AssignmentPriority = "high" | "medium" | "low";

const statusStyles: Record<
  AssignmentStatus,
  { label: string; className: string; icon: any }
> = {
  in_progress: {
    label: "In Progress",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    className: "border-success/30 bg-success/10 text-success",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending PM Approval",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: HelpCircle,
  },
  overdue: {
    label: "Overdue",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
};

const priorityStyles: Record<
  AssignmentPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "border-destructive/30 bg-destructive/10 text-destructive font-semibold",
  },
  medium: {
    label: "Medium",
    className: "border-warning/30 bg-warning/10 text-warning font-semibold",
  },
  low: {
    label: "Low",
    className: "border-border bg-sidebar-accent/50 text-muted-foreground font-semibold",
  },
};

export function RecentAssignments() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Assignments</CardTitle>
          <CardDescription>
            Overview of the latest client assignment submissions and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const assignments = data.recent_assignments;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Assignments</CardTitle>
        <CardDescription>
          Overview of the latest client assignment submissions and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((asg) => {
              const statusCfg = statusStyles[asg.status as AssignmentStatus] || statusStyles.pending;
              const StatusIcon = statusCfg.icon;
              const priorityCfg = priorityStyles[asg.priority as AssignmentPriority] || priorityStyles.medium;

              return (
                <TableRow key={asg.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{asg.name}</span>
                      <span className="font-mono text-muted-foreground text-xs">
                        {asg.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {asg.client}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {asg.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityCfg.className}>
                      {priorityCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusCfg.className}>
                      <StatusIcon className="mr-1 size-3.5" />
                      {statusCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-right text-xs tabular-nums">
                    {asg.deadline}
                  </TableCell>
                </TableRow>
              );
            })}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                  No assignments registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
