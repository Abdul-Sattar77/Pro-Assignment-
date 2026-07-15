"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Clock,
  FileText,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";
import { HeroIllustration } from "./hero-illustration";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut, delay },
  }),
};

const FEATURES = [
  { icon: ShieldCheck, title: "100% Original", note: "Plagiarism-free work" },
  { icon: Clock, title: "On-time delivery", note: "Always on time" },
  { icon: Headphones, title: "24/7 support", note: "We're here anytime" },
];

const STATS = [
  { icon: Users, value: "15,000+", label: "Happy students" },
  { icon: FileText, value: "25,000+", label: "Assignments completed" },
  { icon: Star, value: "4.9/5", label: "Average rating" },
  { icon: ShieldCheck, value: "100%", label: "Satisfaction guarantee" },
];

/**
 * Hero: left-aligned value proposition with a gradient headline and feature
 * row, beside an illustrated assignment workspace that parallaxes to the
 * cursor, over a stats bar. Deep-navy AI aesthetic.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);
  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 70, damping: 20 });
  const my = useSpring(rawY, { stiffness: 70, damping: 20 });

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

  const glowAX = useTransform(mx, [-0.5, 0.5], [30, -30]);
  const glowAY = useTransform(my, [-0.5, 0.5], [24, -24]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative flex min-h-dvh items-center overflow-hidden px-6 pt-28 pb-12"
    >
      {/* Background: drifting glows + grid */}
      <motion.div
        aria-hidden
        style={{ x: glowAX, y: glowAY }}
        className="absolute top-[-10%] right-[6%] size-[38rem] rounded-full bg-blue-600/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute bottom-[-10%] left-[-6%] size-[34rem] rounded-full bg-indigo-600/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(148,178,235,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,178,235,0.045)_1px,transparent_1px)] mask-[radial-gradient(ellipse_80%_70%_at_50%_40%,black,transparent)] bg-size-[54px_54px]"
      />
      <div
        aria-hidden
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <motion.div
              custom={0}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="border-border bg-card/40 text-foreground/80 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs backdrop-blur-md"
            >
              <Sparkles className="size-3.5 text-blue-400" />
              #1 assignment help service
            </motion.div>

            <h1 className="font-display mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              <motion.span
                custom={0.1}
                variants={reveal}
                initial="hidden"
                animate="visible"
                className="block"
              >
                We do your
              </motion.span>
              <motion.span
                custom={0.2}
                variants={reveal}
                initial="hidden"
                animate="visible"
                className="block bg-linear-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent"
              >
                assignments,
              </motion.span>
              <motion.span
                custom={0.3}
                variants={reveal}
                initial="hidden"
                animate="visible"
                className="block"
              >
                you get{" "}
                <span className="relative inline-block bg-linear-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  results
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    className="absolute -bottom-1 left-0 w-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 C50 2 150 2 198 6"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.span>
            </h1>

            <motion.p
              custom={0.4}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="text-foreground/70 mx-auto mt-6 max-w-md text-lg leading-relaxed text-pretty lg:mx-0"
            >
              Expert writers, on-time delivery, and 100% original work — get
              matched with a subject expert and track every step to grade-ready
              results.
            </motion.p>

            <motion.div
              custom={0.5}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                href={orderHref(isAuthed)}
                className="group flex h-13 items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 px-7 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(59,130,246,0.6)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Start your assignment
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#services"
                className="text-foreground/85 hover:text-foreground border-border hover:border-primary/50 flex h-13 items-center gap-2 rounded-xl border px-6 text-base backdrop-blur-sm transition-colors"
              >
                <FileText className="size-4.5" />
                View services
              </a>
            </motion.div>

            {/* Feature row */}
            <motion.div
              custom={0.62}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3"
            >
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center justify-center gap-3 lg:justify-start"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-blue-400/25 bg-blue-500/10 text-blue-300">
                    <feature.icon className="size-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {feature.note}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.25 }}
          >
            <HeroIllustration mx={mx} my={my} />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut, delay: 0.55 }}
          className="border-border bg-card/40 mt-12 grid grid-cols-2 gap-6 rounded-2xl border p-6 backdrop-blur-md sm:grid-cols-4 sm:divide-x sm:divide-white/10"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 sm:justify-center"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 text-blue-300">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
