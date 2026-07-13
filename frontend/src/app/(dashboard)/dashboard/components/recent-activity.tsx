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

import { useDashboardStats } from "@/features/dashboard";
import { Loader2 } from "lucide-react";

const iconMap: Record<string, any> = {
  PlusCircle,
  UserPlus,
  UserCheck,
  FileUp,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
};

export function RecentActivity() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity Feed</CardTitle>
          <CardDescription>
            Operational log of assignment lifecycle stages.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const activities = data.recent_activities;

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
          {activities.map((act) => {
            const Icon = iconMap[act.iconName] || CheckCircle2;
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
          {activities.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">
              No recent activity recorded.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
