"use client";

import { useRef } from "react";
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
  BadgeCheck,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  type LucideIcon,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth";
import { orderHref } from "../constants";
import { CountUp } from "./count-up";
import { Magnetic } from "./magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;
const rise = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
};

const FLOW = ["Submitted", "Assigned", "In progress", "Delivered"];
const SUBJECTS = ["Business", "Nursing", "Law", "CS", "Finance", "+15"];

export function Hero() {
  const { data: user } = useCurrentUser();
  const href = orderHref(Boolean(user));
  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 50, damping: 18 });
  const my = useSpring(rawY, { stiffness: 50, damping: 18 });

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
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#0a1226] via-[#0a1020] to-[#080b18] px-6 pt-32 pb-16"
    >
      {/* Ambient glows */}
      <motion.div
        aria-hidden
        className="absolute top-[-8%] left-1/2 size-150 -translate-x-1/2 rounded-full bg-blue-600/16 blur-[150px]"
        animate={{ opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[6%] bottom-[4%] size-120 rounded-full bg-violet-600/16 blur-[150px]"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Faint animated grid */}
      <motion.div
        aria-hidden
        className="absolute inset-0 mask-[radial-gradient(80%_65%_at_50%_30%,#000,transparent)] opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(130,160,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(130,160,255,0.4) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "0px 54px"] }}
        transition={{ duration: 9, ease: "linear", repeat: Infinity }}
      />

      {/* Floating cartoon characters in the side gutters */}
      <HeroCharacters mx={mx} my={my} />

      {/* ── Centered headline ── */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          custom={0}
          variants={rise}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
        >
          <span className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
            ))}
          </span>
          Rated #1 by 25,000+ students
        </motion.div>

        <motion.h1
          custom={0.1}
          variants={rise}
          initial="hidden"
          animate="visible"
          className="mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl"
        >
          Every assignment,{" "}
          <span className="relative whitespace-nowrap">
            <motion.span
              className="bg-linear-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% auto" }}
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            >
              done brilliantly
            </motion.span>
            <span className="text-sky-400">.</span>
          </span>
        </motion.h1>

        <motion.p
          custom={0.2}
          variants={rise}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-white/60"
        >
          Writing, research, coding, editing and proofreading — matched to a
          subject specialist and delivered exactly to your brief.
        </motion.p>

        <motion.div
          custom={0.3}
          variants={rise}
          initial="hidden"
          animate="visible"
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <Link
              href={href}
              className="group flex h-13 items-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600 px-7 text-base font-semibold text-white shadow-[0_16px_40px_-12px_rgba(37,99,235,0.7)] transition-all duration-200 hover:shadow-[0_22px_54px_-10px_rgba(37,99,235,0.9)] active:scale-[0.98]"
            >
              Submit Assignment
              <span className="flex size-6 items-center justify-center rounded-full bg-white/25 transition-transform duration-200 group-hover:translate-x-1.5">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a
              href="#services"
              className="group flex h-13 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 text-base font-medium text-white/85 backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/10"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                <Play className="size-3 fill-sky-300" />
              </span>
              See how it works
            </a>
          </Magnetic>
        </motion.div>
      </div>

      {/* ── Bento showcase ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.45 },
          },
        }}
        className="relative z-10 mx-auto mt-14 grid w-full max-w-5xl grid-cols-2 gap-4 lg:auto-rows-[184px] lg:grid-cols-4"
      >
        {/* Feature — live tracker (2x2) */}
        <Tile className="col-span-2 lg:row-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
              <FileText className="size-4" />
            </span>
            <span className="text-sm font-semibold text-white/85">
              Live assignment tracking
            </span>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <BadgeCheck className="size-3" /> Grade A+
            </span>
          </div>
          {/* Status flow */}
          <div className="mt-5 space-y-3">
            {FLOW.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <motion.span
                  className={`flex size-5 items-center justify-center rounded-full ${
                    i < 3 ? "bg-emerald-500" : "bg-sky-500"
                  }`}
                  animate={i === 3 ? { scale: [1, 1.18, 1] } : {}}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <BadgeCheck className="size-3 text-white" />
                </motion.span>
                <span className="text-sm text-white/70">{step}</span>
                {i === 3 && (
                  <span className="ml-auto text-[10px] text-sky-300">now</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-sky-400 to-indigo-400"
                initial={{ width: "0%" }}
                animate={{ width: "88%" }}
                transition={{ duration: 1.4, delay: 0.8, ease: EASE }}
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              0% plagiarism · referenced · on time
            </p>
          </div>
        </Tile>

        {/* Students stat (2x1) */}
        <Tile className="col-span-2">
          <div className="flex h-full flex-col justify-between">
            <div className="flex -space-x-2">
              {[
                "from-sky-400 to-blue-500",
                "from-violet-400 to-fuchsia-500",
                "from-emerald-400 to-teal-500",
                "from-amber-400 to-orange-500",
              ].map((g, i) => (
                <span
                  key={i}
                  className={`size-8 rounded-full border-2 border-[#0b1226] bg-linear-to-br ${g}`}
                />
              ))}
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#0b1226] bg-white/10 text-[10px] font-bold text-white">
                +25k
              </span>
            </div>
            <div>
              <p className="bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-3xl font-extrabold text-transparent">
                <CountUp value={25} suffix="K+" />
              </p>
              <p className="text-xs text-white/55">Students helped worldwide</p>
            </div>
          </div>
        </Tile>

        {/* Rating (1x1) */}
        <Tile className="col-span-1">
          <div className="flex h-full flex-col justify-between">
            <Star className="size-5 fill-amber-400 text-amber-400" />
            <div>
              <p className="text-2xl font-extrabold text-white">
                <CountUp value={4.9} decimals={1} />
              </p>
              <p className="text-[11px] text-white/55">Average rating</p>
            </div>
          </div>
        </Tile>

        {/* On-time (1x1) */}
        <Tile className="col-span-1">
          <div className="flex h-full flex-col justify-between">
            <Clock className="size-5 text-sky-300" />
            <div>
              <p className="text-2xl font-extrabold text-white">
                <CountUp value={98} suffix="%" />
              </p>
              <p className="text-[11px] text-white/55">On time or early</p>
            </div>
          </div>
        </Tile>

        {/* Experts + subjects (2x1) */}
        <Tile className="col-span-2">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-indigo-300" />
            <span className="text-sm font-semibold text-white/85">
              <CountUp value={150} suffix="+" /> PhD-level specialists
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/45">
            Matched to your exact subject — never a generalist.
          </p>
        </Tile>

        {/* Promises (2x1) */}
        <Tile className="col-span-2">
          <div className="grid h-full grid-cols-3 items-center gap-2">
            {[
              {
                icon: ShieldCheck,
                label: "100% original",
                tint: "text-emerald-300",
              },
              {
                icon: MessageSquare,
                label: "Direct chat",
                tint: "text-sky-300",
              },
              {
                icon: Headphones,
                label: "24/7 support",
                tint: "text-violet-300",
              },
            ].map((p) => (
              <div
                key={p.label}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/5">
                  <p.icon className={`size-4.5 ${p.tint}`} />
                </span>
                <span className="text-[11px] text-white/65">{p.label}</span>
              </div>
            ))}
          </div>
        </Tile>
      </motion.div>
    </section>
  );
}

/** Glass bento tile with reveal + hover lift. */
function Tile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE },
        },
      }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-colors duration-300 hover:border-white/20 ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-40 -translate-x-1/2 rounded-full bg-sky-400/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">
        <Sparkles className="absolute top-0 right-0 size-3.5 text-white/10" />
        {children}
      </div>
    </motion.div>
  );
}

/* ── Animated student illustrations (side gutters) ───────────────────────── */

function HeroCharacters({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-5 hidden xl:block"
    >
      {/* Upper gutters — symmetric floating feature chips (bob + parallax). */}
      <Parallax mx={mx} my={my} depth={34} className="top-[19%] left-[4%]">
        <FloatChip
          icon={GraduationCap}
          label="PhD-level experts"
          sub="150+ vetted specialists"
          tint="bg-sky-500/15 text-sky-300"
          delay={0.4}
        />
      </Parallax>
      <Parallax mx={mx} my={my} depth={34} className="top-[19%] right-[4%]">
        <FloatChip
          icon={ShieldCheck}
          label="100% original"
          sub="Turnitin-ready"
          tint="bg-emerald-500/15 text-emerald-300"
          delay={1.1}
        />
      </Parallax>

      {/* Lower gutters — symmetric student illustrations. */}
      <Parallax
        mx={mx}
        my={my}
        depth={22}
        className="top-[62%] left-[2%] w-72 -translate-y-1/2 2xl:w-80"
      >
        <FloatImg
          src="/animations/student-1.svg"
          tint="rgba(56,120,255,0.22)"
        />
      </Parallax>
      <Parallax
        mx={mx}
        my={my}
        depth={22}
        className="top-[62%] right-[2%] w-72 -translate-y-1/2 2xl:w-80"
      >
        <FloatImg
          src="/animations/student-2.svg"
          tint="rgba(139,92,246,0.22)"
          delay={3}
        />
      </Parallax>
    </div>
  );
}

/** Glass feature chip that gently bobs — fills the upper hero gutters. */
function FloatChip({
  icon: Icon,
  label,
  sub,
  tint,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  tint: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex w-56 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_16px_44px_rgba(0,0,0,0.4)] backdrop-blur-md"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay }}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white/90">{label}</p>
        <p className="truncate text-[11px] text-white/50">{sub}</p>
      </div>
    </motion.div>
  );
}

/**
 * Self-animating illustration with a gentle idle float, grounded by a soft
 * spotlight aura + contact shadow so it reads as an intentional composition
 * rather than a graphic stranded in empty gutter space.
 */
function FloatImg({
  src,
  tint,
  delay = 0,
}: {
  src: string;
  tint: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay }}
    >
      {/* Tall spotlight aura — fills the gutter vertically with a soft glow. */}
      <span
        aria-hidden
        className="absolute -inset-x-6 -inset-y-20 -z-10 blur-2xl"
        style={{
          background: `radial-gradient(60% 45% at 50% 50%, ${tint}, transparent 75%)`,
        }}
      />
      <img
        src={src}
        alt=""
        className="h-auto w-full drop-shadow-[0_26px_50px_rgba(0,0,0,0.5)]"
      />
      {/* Contact shadow to seat it on the surface. */}
      <span
        aria-hidden
        className="absolute -bottom-2 left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-full bg-black/45 blur-md"
      />
    </motion.div>
  );
}

/** Positions a child in the gutter and parallaxes it to the cursor. */
function Parallax({
  mx,
  my,
  depth,
  glow,
  className,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  glow?: string;
  className: string;
  children: React.ReactNode;
}) {
  const x = useTransform(mx, [-0.5, 0.5], [-depth, depth]);
  const y = useTransform(my, [-0.5, 0.5], [-depth, depth]);
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      {glow && (
        <span
          className={`absolute inset-4 -z-10 rounded-full ${glow} blur-2xl`}
        />
      )}
      {children}
    </motion.div>
  );
}
