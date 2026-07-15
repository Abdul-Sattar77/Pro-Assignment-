"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, Star } from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";
import { HeroIllustration } from "./hero-illustration";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut, delay },
  }),
};

const TRUST = ["25,000+ Students", "100% Original", "24/7 Support"];

/**
 * Premium, minimal SaaS hero (Stripe / Linear / Vercel feel). Deep-navy canvas
 * with soft grid, blurred radial lights and a slow gradient shift; balanced two
 * columns — value proposition on the left, a single animated workspace
 * illustration on the right. Calm motion, generous whitespace.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);
  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });

  const onPointerMove = (event: React.PointerEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex min-h-dvh items-center overflow-hidden bg-[#070b1a] px-6 py-28"
    >
      {/* Slowly shifting gradient wash (cross-fading light layers) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_25%_30%,rgba(59,130,246,0.16),transparent_70%)]"
        animate={{ opacity: [0.9, 0.3, 0.9] }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_72%_62%,rgba(139,92,246,0.16),transparent_70%)]"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Blurred radial lights */}
      <div
        aria-hidden
        className="absolute top-[-12%] right-[8%] size-[32rem] rounded-full bg-blue-600/15 blur-[150px]"
      />
      <div
        aria-hidden
        className="absolute bottom-[-14%] left-[-4%] size-[30rem] rounded-full bg-violet-600/12 blur-[150px]"
      />
      {/* Very soft grid */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(148,178,235,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,178,235,0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_75%_65%_at_50%_45%,black,transparent)] bg-size-[60px_60px]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-2">
        {/* Left — copy */}
        <div className="text-center lg:text-left">
          <motion.div
            custom={0}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-xs text-white/75 backdrop-blur-md"
          >
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            Trusted by 25,000+ Students
          </motion.div>

          <h1 className="font-display mt-7 text-5xl leading-[1.06] font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
            <motion.span
              custom={0.12}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="block"
            >
              Academic Excellence,
            </motion.span>
            <motion.span
              custom={0.24}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="block bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"
            >
              Delivered On Time.
            </motion.span>
          </h1>

          <motion.p
            custom={0.38}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-pretty text-white/60 lg:mx-0"
          >
            Professional assignment writing, research, editing, proofreading,
            and academic support from expert writers worldwide.
          </motion.p>

          <motion.div
            custom={0.5}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link
              href={orderHref(isAuthed)}
              className="group relative flex h-13 items-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-violet-500 px-8 text-base font-semibold text-white shadow-[0_12px_36px_-10px_rgba(99,102,241,0.7)] transition-all duration-200 hover:shadow-[0_16px_48px_-8px_rgba(99,102,241,0.85)] hover:brightness-110 active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#services"
              className="flex h-13 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 text-base text-white/85 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
            >
              <Play className="size-4 fill-current" />
              View Samples
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            custom={0.62}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/55 lg:justify-start"
          >
            <span className="flex items-center gap-1.5">
              <span className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </span>
              <span className="font-medium text-white/80">4.9/5</span>
            </span>
            {TRUST.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-white/25" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right — single animated illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
        >
          <HeroIllustration mx={mx} my={my} />
        </motion.div>
      </div>
    </section>
  );
}
