"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  MessagesSquare,
  PackageCheck,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { easeOut } from "@/animations/variants";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    title: "Tell us what you need",
    description:
      "Create your order in minutes — topic, requirements, deadline, and any files. Sign in first so everything stays private to you.",
  },
  {
    icon: UserCheck,
    title: "Get matched with an expert",
    description:
      "A project manager reviews your brief and assigns the best-fit specialist from our vetted team.",
  },
  {
    icon: MessagesSquare,
    title: "Track progress & chat",
    description:
      "Follow every milestone in your workspace, message the team, and share files — no more scattered chats.",
  },
  {
    icon: PackageCheck,
    title: "Review, revise, approve",
    description:
      "Receive your completed work, request free revisions if needed, and approve when you're 100% happy.",
  },
];

/** Four-step process with an animated connector line. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-secondary/40 dark:bg-secondary/20 scroll-mt-20 border-y py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            From brief to brilliant in four steps
          </h2>
        </motion.div>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) */}
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: easeOut, delay: 0.3 }}
            className="bg-border absolute top-7 right-[12.5%] left-[12.5%] hidden h-px origin-left lg:block"
          />

          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: index * 0.12,
              }}
              className="relative text-center"
            >
              <div className="bg-background relative z-10 mx-auto flex size-14 items-center justify-center rounded-2xl border shadow-xs">
                <step.icon className="text-primary size-6" />
                <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
