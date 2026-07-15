"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/animations/variants";

/**
 * Shared header for public sub-pages (About, Services, Process, FAQ, Contact).
 * Carries the top padding needed to clear the fixed navbar and sets the
 * academic-studio tone before the page's content begins.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden px-6 pt-36 pb-16 lg:pt-44 lg:pb-20">
      {/* Warm haze backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.10),transparent)]"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}{" "}
          {highlight && <span className="aurora-text">{highlight}</span>}
        </h1>
        <p className="text-foreground/80 mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-pretty">
          {subtitle}
        </p>
      </motion.div>
    </section>
  );
}
