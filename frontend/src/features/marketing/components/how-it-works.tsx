"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Step {
  title: string;
  description: string;
  aside: string;
}

const STEPS: Step[] = [
  {
    title: "Brief us",
    description:
      "Tell us the topic, requirements, and deadline — attach anything useful. You'll sign in first, so your brief stays private to you from the very first word.",
    aside: "~2 minutes",
  },
  {
    title: "We match your expert",
    description:
      "A project manager reads your brief and hand-picks the specialist with the right subject depth. No lotteries, no queues.",
    aside: "same day",
  },
  {
    title: "Watch it take shape",
    description:
      "Milestones, drafts, and messages live in your studio. Ask questions, drop files, request tweaks — everything stays in one thread.",
    aside: "live tracking",
  },
  {
    title: "Approve & done",
    description:
      "Review the finished work. Want changes? Revisions are included. Approve when it's exactly right — the file is yours.",
    aside: "revisions free",
  },
];

/**
 * The process as an editorial timeline: oversized serif numerals, generous
 * whitespace, alternating rhythm — not a four-column icon grid.
 */
export function HowItWorks() {
  return (
    <section
      id="process"
      className="bg-secondary/50 scroll-mt-24 border-b py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[88rem] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            02 — Process
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
            Hand it off in four
            <span className="text-primary italic"> unhurried</span> steps.
          </h2>
        </motion.div>

        <div className="mt-16">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="group grid gap-4 border-t py-10 last:border-b sm:grid-cols-[8rem_1fr_10rem] sm:gap-10 lg:py-12"
            >
              <span className="text-primary/90 font-serif text-6xl leading-none font-medium italic lg:text-7xl">
                {index + 1}
                <span className="text-foreground/20">.</span>
              </span>
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">
                  {step.description}
                </p>
              </div>
              <p className="text-muted-foreground self-start font-mono text-xs tracking-[0.15em] uppercase sm:justify-self-end sm:text-right">
                {step.aside}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
