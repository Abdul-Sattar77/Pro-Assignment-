"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowUpRight,
  CalendarClock,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { easeOut } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";

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

const NEXT_STEPS = [
  {
    icon: Sparkles,
    title: "Place your brief",
    text: "Topic, requirements, deadline, files — ordering opens right here very soon.",
  },
  {
    icon: CalendarClock,
    title: "We match your expert",
    text: "A dedicated manager pairs your brief with the right specialist, same day.",
  },
  {
    icon: MessagesSquare,
    title: "Track everything live",
    text: "Milestones, drafts, and messages arrive in this studio as they happen.",
  },
];

/**
 * The CLIENT landing-after-login: cinematic continuation of the marketing
 * site (per project rule: clients never see the admin shell). Shows real
 * account data and what happens next; the order flow plugs in here when the
 * Assignments module ships.
 */
export function ClientHome() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

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
        <motion.p
          custom={0.28}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground mt-6 max-w-lg text-lg"
        >
          Your private studio is ready. Ordering opens here shortly — until
          then, explore what we take off your plate.
        </motion.p>
        <motion.div
          custom={0.4}
          variants={reveal}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <Link
            href={`${ROUTES.home}#services`}
            className="aurora-glow group inline-flex h-13 items-center gap-2 rounded-full bg-[#d5b36b] px-7 text-base font-semibold text-[#0a0a0c] transition-all duration-200 hover:scale-[1.03] hover:bg-[#e2c584]"
          >
            Browse services
            <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>

      {/* What happens next */}
      <motion.div
        custom={0.5}
        variants={reveal}
        initial="hidden"
        animate="visible"
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
          How your order will flow
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {NEXT_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="aurora-border rounded-2xl p-6 transition-colors hover:border-[#d5b36b]/35"
            >
              <step.icon className="size-5 text-[#d5b36b]" strokeWidth={1.75} />
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
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            Status
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
