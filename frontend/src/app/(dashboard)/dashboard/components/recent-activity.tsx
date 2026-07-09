"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PlusCircle,
  UserPlus,
  UserCheck,
  FileUp,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "completed",
    message: "Assignment ASG-8922 marked 'Completed' and archived",
    timestamp: "2 hours ago",
    icon: CheckCircle2,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    id: "act-2",
    type: "delivered",
    message: "Assignment ASG-8921 'Delivered to Client' for final sign-off",
    timestamp: "4 hours ago",
    icon: Send,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    id: "act-3",
    type: "reviewed",
    message: "PM Alex marked draft 1 as 'Reviewed' for ASG-8921",
    timestamp: "6 hours ago",
    icon: ShieldCheck,
    iconBg: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "act-4",
    type: "submitted",
    message: "Writer David 'Submitted Work' (Draft 1) for ASG-8921",
    timestamp: "9 hours ago",
    icon: FileUp,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "act-5",
    type: "revision_requested",
    message: "Client Acme Corp 'Revision Requested' on ASG-8923",
    timestamp: "1 day ago",
    icon: RefreshCw,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    id: "act-6",
    type: "writer_assigned",
    message: "Writer Sarah 'Assigned' to assignment ASG-8923",
    timestamp: "1 day ago",
    icon: UserCheck,
    iconBg: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "act-7",
    type: "pm_assigned",
    message: "Project Manager Alex 'Assigned' to monitor ASG-8924",
    timestamp: "2 days ago",
    icon: UserPlus,
    iconBg: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    id: "act-8",
    type: "created",
    message: "Client Nova Brands 'Created' new assignment request ASG-8925",
    timestamp: "2 days ago",
    icon: PlusCircle,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity Feed</CardTitle>
        <CardDescription>
          Operational log of assignment lifecycle stages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border pl-6 space-y-6">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative">
                {/* Dot / icon on the line */}
                <div
                  className={`absolute -left-[38px] top-0.5 flex size-6 items-center justify-center rounded-full border border-border bg-background ${act.iconBg} ${act.iconColor}`}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-foreground text-sm font-medium leading-relaxed">
                    {act.message}
                  </p>
                  <span className="font-mono text-muted-foreground text-xs">
                    {act.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
