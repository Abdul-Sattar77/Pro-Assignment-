"use client";

import { type ReactNode, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  Sigma,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { easeOut } from "@/animations/variants";
import { orderHref } from "../constants";

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
 * A floating academic artifact. Two nested layers: the outer follows the cursor
 * (parallax by `depth`), the inner drifts on a gentle infinite loop. Hidden on
 * small screens so the copy stays front-and-centre.
 */
function FloatCard({
  mx,
  my,
  depth,
  className,
  drift = 14,
  duration = 6,
  rotate = 4,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className: string;
  drift?: number;
  duration?: number;
  rotate?: number;
  children: ReactNode;
}) {
  const x = useTransform(mx, [-0.5, 0.5], [-depth, depth]);
  const y = useTransform(my, [-0.5, 0.5], [-depth, depth]);

  return (
    <motion.div
      style={{ x, y }}
      className={`pointer-events-none absolute hidden md:block ${className}`}
    >
      <motion.div
        animate={{ y: [0, -drift, 0], rotate: [-rotate, rotate, -rotate] }}
        transition={{ duration, ease: "easeInOut", repeat: Infinity }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Frosted-glass card wrapper shared by the floating artifacts. */
function Glass({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/12 bg-white/6 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

/** The centrepiece: a sheet of paper being "written" line by line, on a loop. */
function WritingPaper() {
  return (
    <Glass className="w-52">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-[#d5b36b]" />
        <span className="bg-muted-foreground/40 h-1.5 w-16 rounded-full" />
        <FileText className="text-muted-foreground/70 ml-auto size-3.5" />
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((line) => (
          <motion.div
            key={line}
            className="h-1.5 rounded-full bg-linear-to-r from-white/70 to-white/20"
            initial={{ width: "0%" }}
            animate={{
              width: ["0%", `${92 - line * 6}%`, `${92 - line * 6}%`],
            }}
            transition={{
              duration: 1.1,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 4,
              delay: line * 0.5,
              times: [0, 0.5, 1],
            }}
          />
        ))}
      </div>
      {/* Pen nib tracing the last line */}
      <motion.div
        className="mt-3 flex items-center gap-1"
        animate={{ x: [0, 60, 0] }}
        transition={{
          duration: 1.1,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 4,
          delay: 2.5,
        }}
      >
        <div className="bg-muted-foreground/30 h-1.5 flex-1 rounded-full" />
        <div className="size-2 rotate-45 rounded-[2px] bg-[#d5b36b]" />
      </motion.div>
    </Glass>
  );
}

/**
 * Assignment-themed hero. A field of academic artifacts — a paper being
 * written, a code block, a grade badge, formulas, a book — floats over a warm
 * haze and parallaxes to the cursor. Kinetic headline and CTAs sit above it.
 */
export function Hero() {
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);
  const sectionRef = useRef<HTMLElement>(null);

  // Normalised cursor position (-0.5 … 0.5), smoothed with a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  const handlePointer = (event: React.PointerEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // Background glow drifts opposite the cursor for depth.
  const glowX = useTransform(mx, [-0.5, 0.5], [40, -40]);
  const glowY = useTransform(my, [-0.5, 0.5], [30, -30]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointer}
      onPointerLeave={resetPointer}
      className="relative flex min-h-dvh flex-col overflow-hidden"
    >
      {/* Warm haze backdrop (follows the cursor) */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_70%_18%,rgba(213,179,107,0.12),transparent),radial-gradient(ellipse_45%_40%_at_22%_75%,rgba(139,92,246,0.10),transparent),radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,255,255,0.02),transparent)]"
      />
      {/* Faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] mask-[radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)] bg-size-[56px_56px]"
      />

      {/* Floating academic artifacts */}
      <FloatCard mx={mx} my={my} depth={38} className="top-[20%] left-[8%]">
        <WritingPaper />
      </FloatCard>

      <FloatCard
        mx={mx}
        my={my}
        depth={26}
        drift={18}
        duration={7}
        className="top-[24%] right-[9%]"
      >
        <Glass className="w-48 font-mono text-[11px] leading-relaxed">
          <div className="mb-2 flex gap-1.5">
            <span className="size-2 rounded-full bg-red-400/70" />
            <span className="size-2 rounded-full bg-amber-400/70" />
            <span className="size-2 rounded-full bg-emerald-400/70" />
          </div>
          <p>
            <span className="text-violet-300">def</span>{" "}
            <span className="text-sky-300">solve</span>():
          </p>
          <p className="pl-3 text-white/60">return grade</p>
          <p className="text-emerald-300"># A+ guaranteed</p>
        </Glass>
      </FloatCard>

      <FloatCard
        mx={mx}
        my={my}
        depth={54}
        drift={10}
        duration={5.5}
        className="bottom-[22%] left-[14%]"
      >
        <Glass className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Check className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Grade A+</p>
            <p className="text-muted-foreground text-[10px]">
              Delivered on time
            </p>
          </div>
        </Glass>
      </FloatCard>

      <FloatCard
        mx={mx}
        my={my}
        depth={44}
        drift={16}
        duration={6.5}
        className="right-[12%] bottom-[24%]"
      >
        <Glass className="flex items-center gap-2.5">
          <GraduationCap className="size-6 text-[#d5b36b]" />
          <span className="text-sm font-medium text-white">Dissertations</span>
        </Glass>
      </FloatCard>

      <FloatCard
        mx={mx}
        my={my}
        depth={64}
        drift={12}
        duration={5}
        rotate={8}
        className="top-[38%] left-[3%]"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/12 bg-white/6 font-mono text-lg text-violet-200 backdrop-blur-md">
          <Sigma className="size-6" />
        </div>
      </FloatCard>

      <FloatCard
        mx={mx}
        my={my}
        depth={58}
        drift={14}
        duration={7.5}
        rotate={7}
        className="top-[46%] right-[4%]"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 backdrop-blur-md">
          <BookOpen className="size-4 text-sky-300" />
          <span className="font-mono text-[11px] tracking-wide text-white">
            APA · MLA
          </span>
        </div>
      </FloatCard>

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
          [ The pros for your assignments ]
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
          className="text-foreground/85 pointer-events-auto mt-8 max-w-xl text-lg leading-relaxed text-pretty"
        >
          Essays, dissertations, programming, and research — submit your
          assignment, get matched with a subject expert, and track every step to
          polished, grade-ready work.
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
            className="aurora-glow group flex h-14 items-center gap-2 rounded-full bg-[#d5b36b] px-8 text-base font-semibold text-[#0a0a0c] transition-all duration-200 hover:scale-[1.03] hover:bg-[#e2c584] active:scale-[0.98]"
          >
            Start your assignment
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#services"
            className="text-foreground/80 hover:text-foreground flex h-14 items-center rounded-full border border-white/15 px-7 text-base backdrop-blur-sm transition-colors hover:border-[#d5b36b]/50"
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
        Move your cursor — the field responds
      </motion.p>
    </section>
  );
}
