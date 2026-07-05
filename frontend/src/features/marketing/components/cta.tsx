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
      {/* Converging glows */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_60%,rgba(139,92,246,0.22),transparent),radial-gradient(ellipse_35%_30%_at_30%_40%,rgba(34,211,238,0.12),transparent),radial-gradient(ellipse_35%_30%_at_70%_45%,rgba(232,121,249,0.14),transparent)]"
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
            className="aurora-glow group flex h-14 items-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-9 text-base font-semibold text-white transition-transform duration-200 hover:scale-[1.05] active:scale-[0.98]"
          >
            Start your order
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-muted-foreground text-sm">
            Browse freely — your private studio account is created when you
            order.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
