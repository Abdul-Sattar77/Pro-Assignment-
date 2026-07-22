"use client";

import { motion } from "framer-motion";
import {
  Clock,
  GraduationCap,
  Headphones,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { easeOut } from "@/animations/variants";
import { CountUp } from "./count-up";

const VALUES = [
  {
    icon: GraduationCap,
    title: "Subject-matter experts",
    body: "Every assignment is matched to a specialist who actually knows the field — not a generalist working outside their depth.",
  },
  {
    icon: ShieldCheck,
    title: "Original & confidential",
    body: "Work is written from scratch to your brief, plagiarism-checked, and your details are never shared. Your studies stay yours.",
  },
  {
    icon: Target,
    title: "Brief-accurate delivery",
    body: "Word count, referencing style, marking rubric, structure — we build to the specification, not a generic template.",
  },
  {
    icon: Users,
    title: "A managed process",
    body: "A project manager oversees every assignment from submission to delivery, so nothing slips and you always know the status.",
  },
  {
    icon: RefreshCw,
    title: "Free revisions",
    body: "Feedback from your tutor? Send it over. We revise the delivered work against your original brief until it's right.",
  },
  {
    icon: Headphones,
    title: "Real people, any hour",
    body: "Message your writer and project manager directly inside the portal — questions answered day or night, in real time.",
  },
];

const STATS: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
}[] = [
  { value: 15, suffix: "+", label: "Academic disciplines covered" },
  { value: 50000, suffix: "+", label: "Assignments delivered" },
  { value: 150, suffix: "+", label: "Vetted subject specialists" },
  { value: 98, suffix: "%", label: "Delivered on time or early" },
];

/** Concrete promises — the trust section. */
const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "100% original work",
    body: "Written from scratch and plagiarism-scanned before delivery.",
  },
  {
    icon: Clock,
    title: "On-time, every time",
    body: "Milestone-tracked deadlines — with urgent turnarounds available.",
  },
  {
    icon: RefreshCw,
    title: "Unlimited-scope revisions",
    body: "We refine against your brief until the work meets it.",
  },
  {
    icon: ShieldCheck,
    title: "Private & secure",
    body: "Bank-grade security; your identity and files stay confidential.",
  },
];

/** About page body — who we are, our mission, why students trust us. */
export function AboutContent() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      {/* Mission */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-12"
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
          Who we are
        </p>
        <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Academic support, done{" "}
          <span className="aurora-text">the right way.</span>
        </h2>
        <div className="text-foreground/80 mt-6 space-y-4 text-pretty">
          <p>
            Prossignment is an academic writing and assignment-support service
            built for students who want their work done properly — clearly
            argued, correctly referenced, and delivered on time. We pair you
            with an expert in your subject and manage the work from first brief
            to final draft.
          </p>
          <p>
            We started Prossignment because getting help with coursework
            shouldn&apos;t feel like a gamble. Too many services treat academic
            work like a transaction. We treat it like what it is: your degree,
            your deadlines, and your reputation. Every assignment is scoped,
            matched to the right specialist, quality-checked, and tracked
            through a real workflow you can follow.
          </p>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: easeOut, delay: index * 0.08 }}
            className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center"
          >
            <p className="aurora-text font-display text-4xl font-bold">
              <CountUp
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            </p>
            <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Values / why trust us */}
      <div className="mt-16">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#3b82f6]" />
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            Why students trust us
          </p>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: easeOut,
                delay: (index % 2) * 0.08,
              }}
              className="aurora-border rounded-2xl p-6"
            >
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                <value.icon className="size-5" />
              </span>
              <h3 className="font-display mt-4 text-xl font-bold tracking-tight">
                {value.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {value.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Guarantees */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="mt-16 rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-12"
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
          Our promise
        </p>
        <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Guarantees we <span className="aurora-text">stand behind.</span>
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GUARANTEES.map((g, index) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: index * 0.06,
              }}
            >
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                <g.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{g.title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {g.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
