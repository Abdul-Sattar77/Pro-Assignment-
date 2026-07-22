"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format, isAfter } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Star,
  Wallet,
} from "lucide-react";
import { easeOut } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";
import {
  ASSIGNMENT_STATUS,
  StatusBadge,
  useAssignments,
  type Assignment,
} from "@/features/assignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const ACTIVE_STATUSES: string[] = [
  ASSIGNMENT_STATUS.ASSIGNED,
  ASSIGNMENT_STATUS.IN_PROGRESS,
  ASSIGNMENT_STATUS.REVISION_REQUESTED,
  ASSIGNMENT_STATUS.SUBMITTED,
];

function formatPkr(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

/**
 * Real writer dashboard, built entirely from writer-scoped endpoints
 * (useAssignments is auto-scoped to the writer by the backend; /auth/me carries
 * earnings/rating/workload). No mock data. Kept separate from StaffOverview so
 * the PM dashboard is untouched.
 */
export function WriterOverview() {
  const { user } = useAuth();
  const { data, isPending } = useAssignments({ perPage: 100 });

  const assignments = data?.assignments ?? [];
  const active = user?.currentWorkload ?? 0;
  const completed = assignments.filter(
    (a) => a.status === ASSIGNMENT_STATUS.COMPLETED,
  ).length;
  const needsAction = assignments.filter((a) => a.actions.length > 0).length;

  const now = new Date();
  const upcoming = assignments
    .filter(
      (a) =>
        ACTIVE_STATUSES.includes(a.status) &&
        a.deadline &&
        isAfter(new Date(a.deadline), now),
    )
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 5);

  const recent = assignments.slice(0, 5);
  const firstName = user?.name.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Active work",
      value: String(active),
      icon: Briefcase,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      label: "Needs your action",
      value: String(needsAction),
      icon: CalendarClock,
      color: "text-amber-500 dark:text-amber-400",
    },
    {
      label: "Completed",
      value: String(completed),
      icon: CheckCircle2,
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Avg rating",
      value: user?.averageRating ? user.averageRating.toFixed(1) : "—",
      icon: Star,
      color: "text-amber-500 dark:text-amber-400",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-6"
    >
      <motion.div variants={fade}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s your workload at a glance.
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={fade}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="bg-muted flex size-10 items-center justify-center rounded-lg">
                <Icon className={`size-5 ${color}`} />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Earnings banner */}
      <motion.div variants={fade}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs">Total earnings</p>
              <p className="text-primary mt-1 text-3xl font-bold tabular-nums">
                {formatPkr(user?.totalEarnings ?? 0)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                From verified payouts
              </p>
            </div>
            <span className="bg-primary/15 flex size-14 items-center justify-center rounded-2xl">
              <Wallet className="text-primary size-7" />
            </span>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming deadlines */}
        <motion.div variants={fade}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Upcoming deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  Loading…
                </p>
              ) : upcoming.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No upcoming deadlines. You&apos;re all caught up.
                </p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((a) => (
                    <DeadlineRow key={a.id} assignment={a} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent assignments */}
        <motion.div variants={fade}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Your assignments</CardTitle>
              <Link
                href={ROUTES.assignments}
                className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
              >
                View all <ArrowRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  Loading…
                </p>
              ) : recent.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No assignments yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {recent.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/assignments/${a.id}`}
                        className="hover:bg-muted/40 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {a.title}
                        </span>
                        <StatusBadge status={a.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DeadlineRow({ assignment }: { assignment: Assignment }) {
  const due = new Date(assignment.deadline);
  return (
    <li>
      <Link
        href={`/assignments/${assignment.id}`}
        className="hover:bg-muted/40 -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors"
      >
        <CalendarClock className="text-muted-foreground size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm">
          {assignment.title}
        </span>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {format(due, "MMM d, HH:mm")}
        </span>
      </Link>
    </li>
  );
}
