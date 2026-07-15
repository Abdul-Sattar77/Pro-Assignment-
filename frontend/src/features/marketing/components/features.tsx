"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  Lock,
  MessagesSquare,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/animations/variants";

interface Cell {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Bento span classes. */
  span?: string;
}

const CELLS: Cell[] = [
  {
    icon: BadgeCheck,
    title: "Specialists, not generalists",
    description:
      "Writers pass subject exams and trial projects before their first brief — and carry a public rating on every job since. Your work lands with someone who lives the subject.",
    span: "lg:col-span-2",
  },
  {
    icon: CalendarClock,
    title: "Deadline-proof",
    description:
      "Milestones and proactive managers keep 98% of work early or on time.",
  },
  {
    icon: MessagesSquare,
    title: "One live thread",
    description:
      "Briefs, drafts, files, chat — one place. Never chase an email again.",
  },
  {
    icon: RefreshCcw,
    title: "Revisions included",
    description:
      "Feedback is part of the craft. Your expert refines until it's right.",
  },
  {
    icon: Lock,
    title: "Discretion by default",
    description:
      "Encrypted sessions, access-controlled files, strict confidentiality. Your name stays out of it — always.",
    span: "lg:col-span-2",
  },
];

/** Why-us as a glass bento grid. */
export function Features() {
  return (
    <section id="why-us" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="max-w-2xl"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            03 / Why us
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Built like a studio.{" "}
            <span className="aurora-text">Run like a promise.</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CELLS.map((cell, index) => (
            <motion.article
              key={cell.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: easeOut, delay: index * 0.06 }}
              className={cn(
                "aurora-border group relative overflow-hidden rounded-2xl p-6 transition-colors duration-300 hover:border-[#3b82f6]/35",
                cell.span,
              )}
            >
              <div
                aria-hidden
                className="absolute -top-16 -right-16 size-40 rounded-full bg-[#3b82f6]/6 blur-2xl transition-all duration-500 group-hover:bg-[#3b82f6]/12"
              />
              <cell.icon className="aurora-text size-6" strokeWidth={1.75} />
              <h3 className="font-display mt-4 text-xl font-bold tracking-tight">
                {cell.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {cell.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
