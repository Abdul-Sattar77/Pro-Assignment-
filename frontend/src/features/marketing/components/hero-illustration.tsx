"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

/**
 * ONE premium workspace illustration for the hero — a laptop with the
 * assignment document floating above it, being "typed" line by line with a
 * blinking caret and a verification check on completion, over a slowly
 * rotating glow with drifting particles. Deliberately singular and calm
 * (Stripe / Linear feel), not a cluster of cards. Parallaxes gently to the
 * cursor. One 6s loop keeps every element in sync.
 */

const CYCLE = 6;

// Typed lines: [target width, y offset in px, start fraction of the cycle].
const LINES: [string, number, number][] = [
  ["92%", 0, 0.08],
  ["78%", 18, 0.2],
  ["88%", 36, 0.32],
  ["60%", 54, 0.44],
];

const PARTICLES = [
  { left: "12%", size: 5, delay: 0, duration: 7 },
  { left: "28%", size: 3, delay: 1.4, duration: 9 },
  { left: "48%", size: 4, delay: 2.6, duration: 8 },
  { left: "68%", size: 3, delay: 0.8, duration: 10 },
  { left: "82%", size: 5, delay: 3.2, duration: 7.5 },
  { left: "92%", size: 3, delay: 1.9, duration: 9.5 },
];

export function HeroIllustration({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const sceneX = useTransform(mx, [-0.5, 0.5], [-10, 10]);
  const sceneY = useTransform(my, [-0.5, 0.5], [-8, 8]);
  const docX = useTransform(mx, [-0.5, 0.5], [-20, 20]);
  const docY = useTransform(my, [-0.5, 0.5], [-14, 14]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      {/* Rotating glow behind the workspace */}
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #3b82f6, #6366f1, #a855f7, #3b82f6)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      />

      {/* Drifting particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute bottom-[14%] rounded-full bg-blue-400/70"
          style={{ left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -170], opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}

      {/* Whole scene: gentle float + mouse parallax */}
      <motion.div className="absolute inset-0" style={{ x: sceneX, y: sceneY }}>
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        >
          <svg viewBox="0 0 460 400" className="h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="screenG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#16224a" />
                <stop offset="1" stopColor="#0a1330" />
              </linearGradient>
              <linearGradient id="deckG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#223056" />
                <stop offset="1" stopColor="#141d3a" />
              </linearGradient>
            </defs>

            {/* Soft floor shadow */}
            <ellipse
              cx="230"
              cy="330"
              rx="150"
              ry="26"
              fill="#000"
              opacity="0.35"
            />

            {/* Coffee cup (front-left) */}
            <g>
              <rect
                x="70"
                y="286"
                width="40"
                height="30"
                rx="8"
                fill="#2563eb"
              />
              <path
                d="M110 292 q14 0 14 9 t-14 9"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
              />
              <ellipse cx="90" cy="288" rx="18" ry="5" fill="#1d4ed8" />
              <motion.path
                d="M84 280 q-4 -8 0 -14"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={{ opacity: [0, 0.6, 0], y: [0, -6, -12] }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </g>

            {/* Notebook + pencil (front-right) */}
            <g transform="rotate(8 360 300)">
              <rect
                x="300"
                y="278"
                width="108"
                height="44"
                rx="6"
                fill="#1e293b"
              />
              <rect x="300" y="278" width="14" height="44" fill="#0f172a" />
              {[286, 296, 306, 316].map((cy) => (
                <circle key={cy} cx="307" cy={cy} r="2.5" fill="#334155" />
              ))}
              <line
                x1="326"
                y1="292"
                x2="392"
                y2="292"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <line
                x1="326"
                y1="302"
                x2="384"
                y2="302"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <line
                x1="326"
                y1="312"
                x2="392"
                y2="312"
                stroke="#475569"
                strokeWidth="2.5"
              />
              <rect
                x="356"
                y="252"
                width="6"
                height="46"
                rx="2"
                fill="#f59e0b"
                transform="rotate(32 359 275)"
              />
              <path
                d="M372 262 l6 -3 l-1 6 Z"
                fill="#0f172a"
                transform="rotate(32 375 262)"
              />
            </g>

            {/* Laptop */}
            <rect
              x="110"
              y="70"
              width="240"
              height="158"
              rx="14"
              fill="#0e1730"
              stroke="#2b3a63"
              strokeWidth="3"
            />
            <rect
              x="122"
              y="82"
              width="216"
              height="134"
              rx="8"
              fill="url(#screenG)"
            />
            {/* Light reflection sweep across screen */}
            <motion.rect
              x="122"
              y="82"
              width="60"
              height="134"
              fill="#ffffff"
              opacity="0.06"
              transform="skewX(-18)"
              animate={{ x: [80, 300] }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
            <rect
              x="110"
              y="224"
              width="240"
              height="8"
              rx="3"
              fill="#1b2a4d"
            />
            <path
              d="M74 232 L386 232 L414 266 Q417 271 410 271 L50 271 Q43 271 46 266 Z"
              fill="url(#deckG)"
            />
            <rect x="196" y="246" width="68" height="9" rx="4" fill="#2a3a63" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating assignment document (typed on a loop) */}
      <motion.div
        className="absolute top-[6%] left-1/2 w-[54%] -translate-x-1/2"
        style={{ x: docX, y: docY }}
      >
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          className="relative rounded-2xl border border-white/60 bg-white p-4 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)]"
        >
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="h-2 w-16 rounded bg-slate-300" />
            <span className="ml-auto text-[9px] font-bold tracking-wide text-blue-600">
              ASSIGNMENT
            </span>
          </div>

          {/* Typed lines + caret */}
          <div className="relative h-16">
            {LINES.map(([width, top, start], i) => (
              <motion.div
                key={i}
                className="absolute h-2 rounded bg-slate-200"
                style={{ top }}
                animate={{ width: ["0%", "0%", width, width, "0%"] }}
                transition={{
                  duration: CYCLE,
                  ease: "easeInOut",
                  repeat: Infinity,
                  times: [0, start, start + 0.06, 0.9, 0.97],
                }}
              />
            ))}
            {/* Blinking caret that steps to each line's end */}
            <motion.div
              className="absolute"
              animate={{
                top: LINES.map(([, top]) => top).concat(54),
                left: LINES.map(([w]) => w).concat("60%"),
              }}
              transition={{
                duration: CYCLE,
                repeat: Infinity,
                times: [0, 0.2, 0.32, 0.44, 1],
              }}
            >
              <motion.div
                className="h-3 w-0.5 bg-blue-500"
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Verification check appears on completion */}
          <motion.div
            className="absolute -right-3 -bottom-3 flex size-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
            animate={{ scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
            transition={{
              duration: CYCLE,
              repeat: Infinity,
              times: [0, 0.82, 0.88, 0.96, 0.99],
            }}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none">
              <path
                d="M5 12l5 5L19 7"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
