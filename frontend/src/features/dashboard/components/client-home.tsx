"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  FilePlus2,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { easeOut } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";
import { StatusBadge, useAssignments } from "@/features/assignments";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut, delay },
  }),
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const STEPS = [
  {
    icon: Sparkles,
    title: "Submit your brief",
    text: "Topic, requirements, deadline — it takes about two minutes.",
  },
  {
    icon: CalendarClock,
    title: "We match your expert",
    text: "A dedicated manager pairs your brief with the right specialist, same day.",
  },
  {
    icon: MessagesSquare,
    title: "Track everything live",
    text: "Milestones and updates land on your assignment's timeline as they happen.",
  },
];

/**
 * The CLIENT landing-after-login: cinematic continuation of the marketing
 * site (per project rule: clients never see the admin shell). Live "My
 * orders" + the order CTA; real account data below.
 */
export function ClientHome() {
  const { user } = useAuth();
  const { data: ordersPage, isPending: ordersLoading } = useAssignments({
    perPage: 5,
  });

  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;
  const orders = ordersPage?.assignments ?? [];
  const hasOrders = orders.length > 0;

  return (
    <div className="space-y-16">
      {/* Greeting */}
      <div>
        <motion.p
          custom={0.05}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase"
        >
          [ {greeting()} ]
        </motion.p>
        <motion.h1
          custom={0.15}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="font-display mt-4 text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl"
        >
          Welcome back,
          <br />
          <span className="aurora-text">{firstName}.</span>
        </motion.h1>
        <motion.div
          custom={0.3}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <Link
            href={ROUTES.newOrder}
            className="aurora-glow group inline-flex h-13 items-center gap-2 rounded-full bg-[#3b82f6] px-7 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-[#60a5fa]"
          >
            <FilePlus2 className="size-5" />
            Submit assignment
            <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {hasOrders && (
            <Link
              href={ROUTES.assignments}
              className="text-foreground/80 hover:text-foreground flex h-13 items-center rounded-full border border-white/15 px-6 text-sm transition-colors hover:border-white/30"
            >
              All my assignments
            </Link>
          )}
        </motion.div>
      </div>

      {/* My orders */}
      <motion.div
        custom={0.42}
        variants={reveal}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-baseline justify-between">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            My assignments
          </p>
          {hasOrders && (
            <Link
              href={ROUTES.assignments}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
            >
              View all →
            </Link>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {ordersLoading &&
            Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="aurora-border h-20 animate-pulse rounded-2xl"
              />
            ))}

          {!ordersLoading && !hasOrders && (
            <div className="aurora-border rounded-2xl px-6 py-10 text-center">
              <p className="font-display text-lg font-bold">
                No assignments yet — submit your first brief to get started.
              </p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
                Tell us what you need and a manager will match you with the
                right expert today.
              </p>
            </div>
          )}

          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/assignments/${order.id}`}
              className="aurora-border group flex items-center justify-between gap-4 rounded-2xl px-6 py-4 transition-colors hover:border-[#3b82f6]/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{order.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {order.subject} · due{" "}
                  {format(new Date(order.deadline), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={order.status} />
                <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* How it flows */}
      <motion.div
        custom={0.52}
        variants={reveal}
        initial="hidden"
        animate="visible"
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
          How your assignment flows
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="aurora-border rounded-2xl p-6 transition-colors hover:border-[#3b82f6]/35"
            >
              <step.icon className="size-5 text-[#3b82f6]" strokeWidth={1.75} />
              <p className="font-display mt-4 text-lg font-bold">
                <span className="aurora-text mr-2">0{index + 1}</span>
                {step.title}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account strip (real data) */}
      <motion.div
        custom={0.6}
        variants={reveal}
        initial="hidden"
        animate="visible"
        className="aurora-border flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5"
      >
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            Account
          </p>
          <p className="mt-1 text-sm font-medium">{user.email}</p>
        </div>
        {user.university && (
          <div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
              University
            </p>
            <p className="mt-1 text-sm font-medium">
              {user.university}
              {user.department && ` · ${user.department}`}
              {user.studyYear && ` · ${user.studyYear}`}
            </p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            Member since
          </p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {user.createdAt
              ? format(new Date(user.createdAt), "MMMM d, yyyy")
              : "—"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
