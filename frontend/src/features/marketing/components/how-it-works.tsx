"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { easeOut } from "@/animations/variants";

interface Step {
  title: string;
  description: string;
  meta: string;
}

const STEPS: Step[] = [
  {
    title: "Brief us",
    description:
      "Topic, requirements, deadline, files. You sign in first — your brief stays private from the first word.",
    meta: "~2 min",
  },
  {
    title: "Expert matched",
    description:
      "A project manager hand-picks the specialist with the right subject depth. No queues, no lotteries.",
    meta: "same day",
  },
  {
    title: "Watch it happen",
    description:
      "Milestones, drafts, and chat in one live thread. Ask, react, redirect — in real time.",
    meta: "live",
  },
  {
    title: "Approve & own it",
    description:
      "Review, request free revisions, approve when perfect. The work is yours.",
    meta: "revisions free",
  },
];

/**
 * Process rail: a gradient progress line draws itself as you scroll while
 * each step ignites in sequence.
 */
export function HowItWorks() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 75%", "end 45%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="max-w-2xl"
        >
          <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
            02 / Process
          </p>
          <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Four steps. <span className="aurora-text">Zero friction.</span>
          </h2>
        </motion.div>

        <div ref={railRef} className="relative mt-14 pl-8 sm:pl-12">
          {/* Rail */}
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-[7px] w-px bg-white/10 sm:left-[11px]"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: lineScale }}
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-linear-to-b from-[#ecd9a8] via-[#d5b36b] to-[#8a6d33] sm:left-[11px]"
          />

          <div className="space-y-14">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="relative"
              >
                {/* Node */}
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-8 flex size-4 items-center justify-center sm:-left-12 sm:size-6"
                >
                  <span className="absolute size-full animate-ping rounded-full bg-[#d5b36b]/20 [animation-duration:2.5s]" />
                  <span className="aurora-glow relative size-2.5 rounded-full bg-[#d5b36b] sm:size-3" />
                </span>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="aurora-text font-display text-lg font-bold">
                    0{index + 1}
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {step.title}
                  </h3>
                  <span className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
                    {step.meta}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
