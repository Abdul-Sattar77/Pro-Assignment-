"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MousePointer2 } from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

/** WebGL loads client-side only; a nebula gradient holds the frame until then. */
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});

const HEADLINE_TOP = ["Assignments,"];
const HEADLINE_BOTTOM = ["mastered."];

const wordReveal = {
  hidden: { opacity: 0, y: 40, rotateX: 45 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: easeOut, delay },
  }),
};

/**
 * Cinematic hero: full-viewport aurora particle field (Three.js) with kinetic
 * typography floating above it. The field's crests follow the cursor.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Nebula backdrop (also the WebGL fallback) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_70%_20%,rgba(139,92,246,0.22),transparent),radial-gradient(ellipse_45%_40%_at_25%_70%,rgba(34,211,238,0.12),transparent),radial-gradient(ellipse_40%_35%_at_85%_80%,rgba(232,121,249,0.10),transparent)]"
      />

      {/* Three.js particle field */}
      <div aria-hidden className="absolute inset-0">
        <HeroScene />
      </div>

      {/* Bottom fade into the page body */}
      <div
        aria-hidden
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t to-transparent"
      />

      {/* Content */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.p
          custom={0.1}
          variants={wordReveal}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground pointer-events-auto font-mono text-xs tracking-[0.35em] uppercase"
        >
          [ The assignment studio ]
        </motion.p>

        <h1
          className="font-display mt-8 text-6xl leading-[0.95] font-bold tracking-tight sm:text-8xl lg:text-9xl"
          style={{ perspective: 800 }}
        >
          {HEADLINE_TOP.map((word, index) => (
            <motion.span
              key={word}
              custom={0.25 + index * 0.12}
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              className="block"
            >
              {word}
            </motion.span>
          ))}
          {HEADLINE_BOTTOM.map((word, index) => (
            <motion.span
              key={word}
              custom={0.45 + index * 0.12}
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              className="aurora-text block pb-3"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          custom={0.7}
          variants={wordReveal}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground pointer-events-auto mt-8 max-w-xl text-lg text-pretty"
        >
          Brief a vetted expert, watch the work take shape live, and approve
          when it&apos;s perfect — inside one luminous workspace.
        </motion.p>

        <motion.div
          custom={0.85}
          variants={wordReveal}
          initial="hidden"
          animate="visible"
          className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href={orderHref(isAuthed)}
            className="aurora-glow group flex h-14 items-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 text-base font-semibold text-white transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
          >
            Start your order
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#services"
            className="text-foreground/80 hover:text-foreground flex h-14 items-center rounded-full border border-white/15 px-7 text-base backdrop-blur-sm transition-colors hover:border-white/30"
          >
            Explore the studio
          </a>
        </motion.div>
      </div>

      {/* Cursor hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="text-muted-foreground/70 pointer-events-none relative z-10 mb-8 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.25em] uppercase"
      >
        <MousePointer2 className="size-3.5" />
        Move your cursor — the field responds
      </motion.p>
    </section>
  );
}
