"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Bell,
  Calendar,
  MessageSquare,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";
import { Can, useAuth } from "@/features/auth";
import { useDashboardStats } from "../hooks/use-dashboard";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const STATUS_STYLES: Record<string, string> = {
  revision_requested: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  under_review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  submitted: "bg-green-500/15 text-green-400 border-green-500/30",
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export function StaffOverview() {
  const { user } = useAuth();
  const { data: stats, isPending, isError } = useDashboardStats();

  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

  // Stats values — real data ya fallback 0
  const totalAssigned = stats?.stats.active_assignments ?? 0;
  const pendingReview = stats?.stats.pending_assignments ?? 0;
  const overdue = stats?.stats.overdue_assignments ?? 0;
  const completed = stats?.stats.completed_assignments ?? 0;
  const recentAssignments = stats?.recent_assignments ?? [];
  const recentActivities = stats?.recent_activities ?? [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Banner ── */}
      <motion.div
        variants={fadeIn}
        className="relative overflow-hidden rounded-2xl border"
      >
        <Image
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=80"
          alt="Library"
          width={1800}
          height={520}
          priority
          className="h-48 w-full object-cover sm:h-56"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-[#070b18]/92 via-[#070b18]/65 to-[#070b18]/25"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-9">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#3b82f6] uppercase">
            {greeting()}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#eaf0ff] sm:text-4xl">
            {firstName}&apos;s workspace
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {user.roles.map((role) => (
              <Badge
                key={role}
                className="border-[#3b82f6]/40 bg-[#3b82f6]/15 text-[#bfdbfe] capitalize"
                variant="outline"
              >
                {role.replace("_", " ")}
              </Badge>
            ))}
            {overdue > 0 && (
              <Badge
                className="border-red-500/40 bg-red-500/15 text-red-400"
                variant="outline"
              >
                ⚠ {overdue} overdue
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          {
            label: "Total Assigned",
            value: totalAssigned,
            icon: FileText,
            color: "text-primary",
            bg: "bg-primary/10",
            href: ROUTES.assignments,
          },
          {
            label: "Pending Review",
            value: pendingReview,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            href: ROUTES.assignments,
          },
          {
            label: "Overdue",
            value: overdue,
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-400/10",
            href: ROUTES.assignments,
          },
          {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-green-400",
            bg: "bg-green-400/10",
            href: ROUTES.assignments,
          },
        ].map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-muted/30 cursor-pointer transition-colors">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`size-8 rounded-lg ${bg} flex items-center justify-center`}
                  >
                    <Icon className={`size-4 ${color}`} />
                  </div>
                  {isPending ? (
                    <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
                  ) : (
                    <ArrowUpRight className="text-muted-foreground size-3.5" />
                  )}
                </div>
                <p className={`text-2xl font-bold ${color}`}>
                  {isPending ? "—" : value}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="grid gap-4 lg:grid-cols-3">
        {/* ── Needs Attention ── */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="text-primary size-4" />
                Needs Attention
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href={ROUTES.assignments}>View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isPending && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            )}
            {isError && (
              <p className="text-muted-foreground py-4 text-center text-xs">
                Could not load assignments.
              </p>
            )}
            {!isPending && recentAssignments.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No assignments yet.
              </p>
            )}
            {recentAssignments.map((a) => (
              <Link key={a.id} href={`${ROUTES.assignments}/${a.uuid}`}>
                <div className="hover:bg-muted/40 flex items-center gap-3 rounded-lg p-2.5 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-medium">{a.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {a.subject}
                      </p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {a.client}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_STYLES[a.status] ?? ""}`}
                    >
                      {a.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${PRIORITY_STYLES[a.priority] ?? ""}`}
                    >
                      {a.priority}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* ── Quick Actions ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
            <CardDescription className="text-xs">
              Jump to your most used features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                label: "View Assignments",
                icon: FileText,
                href: ROUTES.assignments,
                color: "text-primary",
              },
              {
                label: "Check Messages",
                icon: MessageSquare,
                href: ROUTES.messaging,
                color: "text-blue-400",
              },
              {
                label: "Today's Calendar",
                icon: Calendar,
                href: ROUTES.calendar,
                color: "text-amber-400",
              },
              {
                label: "Manage Files",
                icon: FolderOpen,
                href: ROUTES.files,
                color: "text-purple-400",
              },
              {
                label: "View Leads",
                icon: TrendingUp,
                href: ROUTES.leads,
                color: "text-green-400",
              },
            ].map(({ label, icon: Icon, href, color }) => (
              <Button
                key={label}
                variant="ghost"
                className="h-9 w-full justify-start gap-2 text-xs"
                asChild
              >
                <Link href={href}>
                  <Icon className={`size-4 ${color}`} />
                  {label}
                </Link>
              </Button>
            ))}
            <Separator className="my-1" />
            <Can permission="users.view">
              <Button
                variant="ghost"
                className="h-9 w-full justify-start gap-2 text-xs"
                asChild
              >
                <Link href={ROUTES.users}>
                  <Users className="text-muted-foreground size-4" />
                  Manage Users
                </Link>
              </Button>
            </Can>
            <Button
              variant="ghost"
              className="h-9 w-full justify-start gap-2 text-xs"
              asChild
            >
              <Link href="/profile">
                <Bell className="text-muted-foreground size-4" />
                My Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="text-primary size-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {isPending && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground size-5 animate-spin" />
              </div>
            )}
            {!isPending && recentActivities.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No recent activity.
              </p>
            )}
            {recentActivities.map((a, i) => (
              <div key={a.id}>
                <div className="flex items-start gap-3 py-2.5">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed">{a.message}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {a.timestamp}
                    </p>
                  </div>
                </div>
                {i < recentActivities.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
