"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

/**
 * Finale: gradient supernova headline over converging glows, one glowing CTA.
 */
export function Cta() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      {/* Converging warm glows */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_60%,rgba(59,130,246,0.13),transparent),radial-gradient(ellipse_35%_30%_at_28%_40%,rgba(59,130,246,0.06),transparent),radial-gradient(ellipse_40%_35%_at_72%_45%,rgba(255,255,255,0.03),transparent)]"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase"
        >
          05 / Begin
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
          className="font-display mt-6 text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-7xl"
        >
          Your next deadline,
          <br />
          <span className="aurora-text">already handled.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Link
            href={orderHref(isAuthed)}
            className="aurora-glow group flex h-14 items-center gap-2 rounded-full bg-[#3b82f6] px-9 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.04] hover:bg-[#60a5fa] active:scale-[0.98]"
          >
            Submit your assignment
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-muted-foreground text-sm">
            Browse freely — your private student account is created when you
            submit.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
