"use client";

import { useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ImageIcon } from "lucide-react";

/**
 * Right-side story illustration. Displays the hero artwork
 * (public/hero-illustration.png) and brings it to life with ambient motion the
 * asset itself can't carry: a rotating glow, drifting particles, twinkling
 * sparkles, a gentle float, mouse parallax and a hover 3D-tilt. A guided
 * placeholder shows until the image is added. For per-character motion (blink,
 * write, fly) supply separated PNG layers or a Lottie file.
 */

const SPARKS = [
  { top: "8%", left: "20%", size: 8, delay: 0 },
  { top: "16%", left: "82%", size: 6, delay: 0.8 },
  { top: "54%", left: "94%", size: 7, delay: 1.6 },
  { top: "78%", left: "10%", size: 6, delay: 2.2 },
  { top: "40%", left: "4%", size: 5, delay: 1.1 },
];

const PARTICLES = [
  { left: "14%", size: 5, delay: 0, duration: 9 },
  { left: "34%", size: 3, delay: 1.8, duration: 11 },
  { left: "60%", size: 4, delay: 2.7, duration: 10 },
  { left: "80%", size: 3, delay: 1.0, duration: 12 },
  { left: "92%", size: 4, delay: 3.3, duration: 9.5 },
];

export function HeroIllustration({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const [failed, setFailed] = useState(false);

  const rotateX = useTransform(my, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-6, 6]);
  const px = useTransform(mx, [-0.5, 0.5], [-12, 12]);
  const py = useTransform(my, [-0.5, 0.5], [-9, 9]);

  return (
    <div
      className="relative mx-auto w-full max-w-2xl"
      style={{ perspective: 1200 }}
    >
      {/* Rotating glow */}
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #3b82f6, #6366f1, #a855f7, #3b82f6)",
          willChange: "transform",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent_62%)]"
      />

      {/* Rising particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute bottom-[10%] rounded-full bg-blue-400/70"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
          }}
          animate={{ y: [0, -200], opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}

      {/* Illustration (or guided placeholder) */}
      <motion.div
        style={{ rotateX, rotateY, x: px, y: py, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          style={{ willChange: "transform" }}
        >
          {!failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero-illustration.png"
              alt="Students completing their assignments with expert help"
              onError={() => setFailed(true)}
              className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <div className="flex aspect-[5/4] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                <ImageIcon className="size-7" />
              </span>
              <p className="text-sm font-medium text-white/85">
                Add your hero illustration
              </p>
              <p className="max-w-xs text-xs text-white/50">
                Save the artwork as{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-blue-200">
                  frontend/public/hero-illustration.png
                </code>{" "}
                and it appears here — fully animated.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Twinkling sparkles over the scene */}
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1, 0.7] }}
          transition={{
            duration: 2.8,
            delay: s.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <svg viewBox="0 0 24 24" className="size-full" fill="#bfdbfe">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
        </motion.span>
      ))}
    </div>
  );
}
