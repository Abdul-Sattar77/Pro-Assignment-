"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Clock,
  FileText,
  Headphones,
  ShieldCheck,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { orderHref } from "../constants";
import { CountUp } from "./count-up";
import { HeroIllustration } from "./hero-illustration";
import { Magnetic } from "./magnetic";

// power3.out-ish easing; each element delayed by ~0.08s.
const EASE = [0.16, 1, 0.3, 1] as const;
const rise = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

const LINE1 = ["Complete", "Your"];
const LINE3 = ["Without", "The"];

const FEATURES = [
  { icon: ShieldCheck, title: "100% Original", note: "Plagiarism Free Work" },
  { icon: Clock, title: "On-Time Delivery", note: "Always On Time" },
  { icon: Headphones, title: "24/7 Support", note: "We're Here Anytime" },
];

const STATS = [
  { icon: Users, value: 25000, suffix: "+", label: "Happy Students" },
  { icon: FileText, value: 50000, suffix: "+", label: "Assignments Completed" },
  {
    icon: Star,
    value: 4.9,
    suffix: "/5",
    decimals: 1,
    label: "Average Rating",
  },
  { icon: Trophy, value: 98, suffix: "%", label: "Success Rate" },
];

// Twinkling background stars (deterministic positions).
const STARS = [
  ["6%", "18%"],
  ["12%", "72%"],
  ["22%", "40%"],
  ["30%", "88%"],
  ["44%", "16%"],
  ["58%", "78%"],
  ["66%", "34%"],
  ["74%", "90%"],
  ["82%", "22%"],
  ["88%", "60%"],
  ["18%", "54%"],
  ["52%", "46%"],
] as const;

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
      className="relative flex min-h-dvh items-center overflow-hidden bg-[#080b1a] px-6 pt-28 pb-14"
    >
      {/* Background: slowly shifting gradient */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_28%_28%,rgba(59,130,246,0.16),transparent_70%)]"
        animate={{ opacity: [0.9, 0.35, 0.9] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(55%_45%_at_72%_60%,rgba(139,92,246,0.16),transparent_70%)]"
        animate={{ opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Pulsing blur circles */}
      <motion.div
        aria-hidden
        className="absolute top-[-10%] right-[10%] size-[30rem] rounded-full bg-blue-600/12 blur-[150px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-12%] left-[-4%] size-[28rem] rounded-full bg-violet-600/12 blur-[150px]"
        animate={{ scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Animated perspective grid — adds depth under the copy */}
      <motion.div
        aria-hidden
        className="absolute inset-0 mask-[radial-gradient(70%_60%_at_50%_40%,#000,transparent)] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,150,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,255,0.35) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "0px 56px"] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />

      {/* Twinkling stars */}
      {STARS.map(([top, left], i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute size-1 rounded-full bg-white/70"
          style={{ top, left }}
          animate={{ opacity: [0.1, 0.9, 0.1] }}
          transition={{
            duration: 3,
            delay: (i % 5) * 0.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={rise}
              initial="hidden"
              animate="visible"
              className="group inline-flex cursor-default items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-xs text-white/75 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/30 hover:shadow-[0_0_24px_rgba(251,191,36,0.25)]"
            >
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              Rated #1 Assignment Experts
            </motion.div>

            {/* Headline — word by word */}
            <h1 className="font-display mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-6xl">
              <span className="block">
                {LINE1.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={0.15 + i * 0.08}
                    variants={rise}
                    initial="hidden"
                    animate="visible"
                    className="mr-[0.25em] inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>

              <motion.span
                custom={0.33}
                variants={rise}
                initial="hidden"
                animate="visible"
                className="block"
              >
                <motion.span
                  className="inline-block bg-linear-to-r from-violet-400 via-blue-400 to-violet-400 bg-clip-text text-transparent"
                  style={{ backgroundSize: "200% auto" }}
                  animate={{ backgroundPosition: ["0% center", "200% center"] }}
                  transition={{
                    duration: 5,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  Assignments
                </motion.span>
              </motion.span>

              <span className="block">
                {LINE3.map((word, i) => (
                  <motion.span
                    key={word}
                    custom={0.43 + i * 0.08}
                    variants={rise}
                    initial="hidden"
                    animate="visible"
                    className="mr-[0.25em] inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
                <motion.span
                  custom={0.59}
                  variants={rise}
                  initial="hidden"
                  animate="visible"
                  className="relative inline-block"
                >
                  Stress<span className="text-blue-400">.</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 240 14"
                    className="absolute -bottom-2 left-0 w-full"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M4 9 C60 3 180 3 236 7"
                      fill="none"
                      stroke="url(#swoosh)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
                    />
                    <defs>
                      <linearGradient id="swoosh" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#a855f7" />
                        <stop offset="1" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.span>
              </span>
            </h1>

            {/* Description */}
            <motion.p
              custom={0.7}
              variants={rise}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-pretty text-white/60 lg:mx-0"
            >
              Professional assignment writing, research, editing, proofreading
              and academic support from experts worldwide.
            </motion.p>

            {/* Buttons */}
            <motion.div
              custom={0.8}
              variants={rise}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Magnetic>
                <Link
                  href={orderHref(isAuthed)}
                  className="group flex h-13 items-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-blue-500 px-7 text-base font-semibold text-white shadow-[0_12px_36px_-10px_rgba(99,102,241,0.7)] transition-all duration-200 hover:shadow-[0_18px_50px_-8px_rgba(99,102,241,0.9)] active:scale-[0.98]"
                >
                  Submit Assignment
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-2">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href="#services"
                  className="group flex h-13 items-center gap-2 rounded-xl border border-white/15 bg-white/3 px-6 text-base text-white/85 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:text-white"
                >
                  View Samples
                  <FileText className="size-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </Magnetic>
            </motion.div>

            {/* Feature row */}
            <motion.div
              custom={0.9}
              variants={rise}
              initial="hidden"
              animate="visible"
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3"
            >
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center justify-center gap-3 lg:justify-start"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-blue-300">
                    <feature.icon className="size-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {feature.title}
                    </p>
                    <p className="text-xs text-white/50">{feature.note}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — animated illustration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          >
            <HeroIllustration mx={mx} my={my} />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          custom={1}
          variants={rise}
          initial="hidden"
          animate="visible"
          className="mt-12 grid grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:grid-cols-4 sm:divide-x sm:divide-white/10"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 sm:justify-center"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/12 text-blue-300">
                <stat.icon className="size-5" />
              </span>
              <div>
                <p className="text-xl font-bold tracking-tight text-white">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
