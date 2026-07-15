"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
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
  UserRound,
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

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const MOCK_STATS = {
  totalAssigned: 12,
  pendingReview: 3,
  overdue: 2,
  completedThisMonth: 8,
  todayDeadlines: 2,
  unreadMessages: 5,
};

const TODAY_DEADLINES = [
  {
    id: "A-101",
    title: "Essay Writing — 2000 words",
    client: "John Smith",
    time: "11:59 PM",
    priority: "high",
  },
  {
    id: "A-103",
    title: "Case Study — Business Strategy",
    client: "Mike Davis",
    time: "6:00 PM",
    priority: "urgent",
  },
];

const RECENT_ACTIVITY = [
  {
    text: "Writer Sara submitted work for #A-102",
    time: "30 min ago",
    type: "submission",
    icon: CheckCircle2,
    color: "text-green-400",
  },
  {
    text: "Client John requested revision on #A-101",
    time: "2 hrs ago",
    type: "revision",
    icon: AlertTriangle,
    color: "text-amber-400",
  },
  {
    text: "New assignment #A-105 assigned by Admin",
    time: "3 hrs ago",
    type: "new",
    icon: FileText,
    color: "text-blue-400",
  },
  {
    text: "Deadline reminder: #A-103 due today",
    time: "5 hrs ago",
    type: "deadline",
    icon: Clock,
    color: "text-red-400",
  },
  {
    text: "Writer Ahmed accepted assignment #A-104",
    time: "1 day ago",
    type: "accepted",
    icon: UserRound,
    color: "text-purple-400",
  },
];

const PENDING_ASSIGNMENTS = [
  {
    id: "A-101",
    title: "Essay Writing",
    client: "John Smith",
    status: "revision_requested",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: "A-102",
    title: "Research Paper",
    client: "Sarah J.",
    status: "under_review",
    priority: "urgent",
    dueDate: "Tomorrow",
  },
  {
    id: "A-104",
    title: "Marketing Plan",
    client: "Emma W.",
    status: "in_progress",
    priority: "medium",
    dueDate: "Jul 15",
  },
];

const STATUS_STYLES: Record<string, string> = {
  revision_requested: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  under_review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  submitted: "bg-green-500/15 text-green-400 border-green-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export function StaffOverview() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

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
            {MOCK_STATS.overdue > 0 && (
              <Badge
                className="border-red-500/40 bg-red-500/15 text-red-400"
                variant="outline"
              >
                ⚠ {MOCK_STATS.overdue} overdue
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
            value: MOCK_STATS.totalAssigned,
            icon: FileText,
            color: "text-primary",
            bg: "bg-primary/10",
            href: ROUTES.assignments,
          },
          {
            label: "Pending Review",
            value: MOCK_STATS.pendingReview,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            href: ROUTES.assignments,
          },
          {
            label: "Overdue",
            value: MOCK_STATS.overdue,
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-400/10",
            href: ROUTES.assignments,
          },
          {
            label: "Completed",
            value: MOCK_STATS.completedThisMonth,
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
                  <ArrowUpRight className="text-muted-foreground size-3.5" />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="grid gap-4 lg:grid-cols-3">
        {/* ── Today's Deadlines ── */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-red-400" />
              Today&apos;s Deadlines
              <Badge
                variant="outline"
                className="ml-auto border-red-500/30 bg-red-500/10 text-xs text-red-400"
              >
                {TODAY_DEADLINES.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TODAY_DEADLINES.map((d, i) => (
              <div key={d.id}>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium">{d.title}</p>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${PRIORITY_STYLES[d.priority]}`}
                    >
                      {d.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[11px]">
                      {d.client}
                    </p>
                    <p className="text-[11px] font-medium text-red-400">
                      {d.time}
                    </p>
                  </div>
                </div>
                {i < TODAY_DEADLINES.length - 1 && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Pending Assignments ── */}
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
            {PENDING_ASSIGNMENTS.map((a) => (
              <div
                key={a.id}
                className="hover:bg-muted/40 flex items-center gap-3 rounded-lg p-2.5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium">{a.id}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {a.title}
                    </p>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {a.client}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_STYLES[a.status]}`}
                  >
                    {a.status.replace("_", " ")}
                  </Badge>
                  <span className="text-muted-foreground text-[11px]">
                    {a.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity + Quick Actions ── */}
      <motion.div variants={fadeIn} className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="text-primary size-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-2.5">
                  <a.icon className={`size-4 ${a.color} mt-0.5 shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-relaxed">{a.text}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {a.time}
                    </p>
                  </div>
                </div>
                {i < RECENT_ACTIVITY.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
                badge: MOCK_STATS.unreadMessages,
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
            ].map(({ label, icon: Icon, href, color, badge }) => (
              <Button
                key={label}
                variant="ghost"
                className="h-9 w-full justify-start gap-2 text-xs"
                asChild
              >
                <Link href={href}>
                  <Icon className={`size-4 ${color}`} />
                  {label}
                  {badge && (
                    <Badge
                      className="bg-primary/15 text-primary border-primary/30 ml-auto text-[10px]"
                      variant="outline"
                    >
                      {badge}
                    </Badge>
                  )}
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
              <Link href={ROUTES.home} target="_blank">
                <ArrowUpRight className="text-muted-foreground size-4" />
                View Public Site
              </Link>
            </Button>

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

      {/* ── Performance Overview ── */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="text-primary size-4" />
              Performance Overview
            </CardTitle>
            <CardDescription className="text-xs">This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  label: "Assignments Completed",
                  value: "8",
                  sub: "+2 vs last month",
                  color: "text-green-400",
                },
                {
                  label: "Avg Response Time",
                  value: "< 2hrs",
                  sub: "Excellent",
                  color: "text-blue-400",
                },
                {
                  label: "Client Satisfaction",
                  value: "4.8★",
                  sub: "Based on 6 reviews",
                  color: "text-amber-400",
                },
                {
                  label: "Lead Conversion",
                  value: "87%",
                  sub: "54 of 62 leads",
                  color: "text-primary",
                },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="space-y-1">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-muted-foreground text-[11px]">{sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
