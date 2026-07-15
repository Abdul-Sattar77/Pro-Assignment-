"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { easeOut } from "@/animations/variants";

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
];

const STATS = [
  { value: "8+", label: "Academic disciplines covered" },
  { value: "10k+", label: "Assignments delivered" },
  { value: "24/7", label: "Support while you study" },
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
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
              {stat.value}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Values / why trust us */}
      <div className="mt-16">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#d5b36b]" />
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
    </div>
  );
}
