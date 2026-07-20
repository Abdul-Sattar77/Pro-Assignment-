"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

/**
 * Self-contained hero illustration (no external image): a central glass
 * "Assignment" document written line by line, ringed by floating academic
 * tiles, over a rotating glow with drifting particles and twinkling sparkles.
 * Everything parallaxes to the cursor and drifts on gentle loops.
 */

const CYCLE = 6;
const LINES: [string, number][] = [
  ["94%", 0.12],
  ["80%", 0.26],
  ["88%", 0.4],
];

const PARTICLES = [
  { left: "10%", size: 5, delay: 0, duration: 8 },
  { left: "26%", size: 3, delay: 1.6, duration: 10 },
  { left: "52%", size: 4, delay: 2.6, duration: 9 },
  { left: "74%", size: 3, delay: 0.9, duration: 11 },
  { left: "90%", size: 4, delay: 3.2, duration: 8.5 },
];

const SPARKS: [string, string, number][] = [
  ["8%", "22%", 0],
  ["16%", "82%", 0.8],
  ["58%", "92%", 1.6],
  ["80%", "12%", 2.2],
  ["44%", "50%", 1.1],
];

function Tile({
  mx,
  my,
  depth,
  delay,
  className,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  delay: number;
  className: string;
  children: ReactNode;
}) {
  const x = useTransform(mx, [-0.5, 0.5], [-depth, depth]);
  const y = useTransform(my, [-0.5, 0.5], [-depth, depth]);
  return (
    <motion.div style={{ x, y }} className={`absolute z-20 ${className}`}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 5 + delay,
          ease: "easeInOut",
          repeat: Infinity,
          delay,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Pill({
  icon,
  label,
  tint,
}: {
  icon: ReactNode;
  label?: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0e1a36]/80 px-2.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <span
        className={`flex size-8 items-center justify-center rounded-lg ${tint}`}
      >
        {icon}
      </span>
      {label && (
        <span className="pr-1 text-xs font-medium text-white/85">{label}</span>
      )}
    </div>
  );
}

export function HeroIllustration({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const rotateX = useTransform(my, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-7, 7]);
  const cx = useTransform(mx, [-0.5, 0.5], [-8, 8]);
  const cy = useTransform(my, [-0.5, 0.5], [-6, 6]);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-xl"
      style={{ perspective: 1100 }}
    >
      {/* Rotating glow */}
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #3b82f6, #6366f1, #a855f7, #3b82f6)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.15),transparent_62%)]"
      />

      {/* Particles + sparkles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={`p${i}`}
          aria-hidden
          className="absolute bottom-[14%] rounded-full bg-blue-400/70"
          style={{ left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -190], opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
      {SPARKS.map(([top, left, delay], i) => (
        <motion.span
          key={`s${i}`}
          aria-hidden
          className="pointer-events-none absolute size-2"
          style={{ top, left }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1, 0.7] }}
          transition={{
            duration: 2.8,
            delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <svg viewBox="0 0 24 24" className="size-full" fill="#bfdbfe">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
        </motion.span>
      ))}

      {/* Floating academic tiles */}
      <Tile
        mx={mx}
        my={my}
        depth={30}
        delay={0}
        className="top-[4%] left-[24%]"
      >
        <Pill
          icon={<FileText className="size-4.5 text-blue-300" />}
          label="Research"
          tint="bg-blue-500/15"
        />
      </Tile>
      <Tile
        mx={mx}
        my={my}
        depth={40}
        delay={0.6}
        className="top-[9%] right-[6%]"
      >
        <Pill
          icon={<GraduationCap className="size-4.5 text-violet-300" />}
          tint="bg-violet-500/15"
        />
      </Tile>
      <Tile
        mx={mx}
        my={my}
        depth={24}
        delay={1.1}
        className="top-[40%] right-[-3%]"
      >
        <Pill
          icon={<BookOpen className="size-4.5 text-indigo-300" />}
          label="References"
          tint="bg-indigo-500/15"
        />
      </Tile>
      <Tile
        mx={mx}
        my={my}
        depth={46}
        delay={0.3}
        className="top-[44%] left-[-4%]"
      >
        <Pill
          icon={<Lightbulb className="size-4.5 text-amber-300" />}
          label="Ideas"
          tint="bg-amber-500/15"
        />
      </Tile>
      <Tile
        mx={mx}
        my={my}
        depth={28}
        delay={0.9}
        className="bottom-[10%] left-[10%]"
      >
        <Pill
          icon={<CheckCircle2 className="size-4.5 text-emerald-300" />}
          label="Approved"
          tint="bg-emerald-500/15"
        />
      </Tile>

      {/* Central "Assignment" document — written on a loop */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: cx,
          y: cy,
          transformStyle: "preserve-3d",
        }}
        className="absolute top-1/2 left-1/2 z-10 w-[58%] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          className="overflow-hidden rounded-2xl border border-white/12 bg-linear-to-b from-[#12203f]/95 to-[#0a1122]/95 shadow-[0_40px_100px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-white/8 px-3.5 py-2.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-blue-500/15 text-blue-300">
              <FileText className="size-3.5" />
            </span>
            <span className="text-[13px] font-medium text-white/85">
              Assignment.docx
            </span>
            <motion.span
              className="ml-auto size-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>

          <div className="space-y-3.5 px-4 py-4">
            <div className="h-2.5 w-1/2 rounded-full bg-linear-to-r from-blue-400/80 to-indigo-400/50" />
            <div className="relative space-y-3">
              {LINES.map(([width, start], i) => (
                <motion.div
                  key={i}
                  className="h-2 rounded-full bg-white/12"
                  animate={{ width: ["0%", "0%", width, width, "0%"] }}
                  transition={{
                    duration: CYCLE,
                    ease: "easeInOut",
                    repeat: Infinity,
                    times: [0, start, start + 0.08, 0.86, 0.95],
                  }}
                />
              ))}
              <motion.div
                className="absolute left-0"
                animate={{ top: [0, 0, 20, 40, 40] }}
                transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  times: [0, 0.12, 0.26, 0.4, 1],
                }}
              >
                <motion.div
                  className="h-3 w-0.5 rounded-full bg-blue-400"
                  animate={{ opacity: [1, 1, 0, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <motion.div
              className="flex items-center gap-2 pt-0.5"
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{
                duration: CYCLE,
                repeat: Infinity,
                times: [0, 0.78, 0.85, 0.94, 0.99],
              }}
            >
              <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500">
                <svg viewBox="0 0 24 24" className="size-3" fill="none">
                  <path
                    d="M5 12l5 5L19 7"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[11px] text-emerald-300/90">
                0% plagiarism · Grade A+
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
