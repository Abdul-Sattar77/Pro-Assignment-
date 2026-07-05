"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  Lock,
  MessageCircle,
  RefreshCcw,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { easeOut } from "@/animations/variants";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Vetted experts only",
    description:
      "Every writer passes subject tests and quality reviews before joining — and is rated on every single project.",
  },
  {
    icon: CalendarClock,
    title: "Deadlines you can trust",
    description:
      "Milestone tracking and proactive project managers keep 98% of work delivered on or before time.",
  },
  {
    icon: RefreshCcw,
    title: "Free revisions",
    description:
      "Not fully satisfied? Request changes and your expert revises until it matches your brief.",
  },
  {
    icon: Lock,
    title: "Private & secure",
    description:
      "Your identity and files stay confidential. Encrypted sessions, secure storage, and strict access control.",
  },
  {
    icon: MessageCircle,
    title: "Real-time communication",
    description:
      "Chat with your project manager and share files inside your workspace — everything in one place.",
  },
  {
    icon: Wallet,
    title: "Transparent payments",
    description:
      "Clear pricing up front, verified payment records, and invoices you can always refer back to.",
  },
];

/** "Why choose us" grid. */
export function Features() {
  return (
    <section id="why-us" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Why Prossignment
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Built to make quality effortless
          </h2>
          <p className="text-muted-foreground mt-4 text-pretty">
            We replaced scattered chats, spreadsheets, and guesswork with one
            transparent workspace — so you always know where your work stands.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: (index % 3) * 0.08,
              }}
              className="flex gap-4"
            >
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                <feature.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
