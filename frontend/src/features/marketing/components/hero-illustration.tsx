"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Pencil, Search, Upload } from "lucide-react";

/**
 * Hero illustration — an assignment "workspace" scene: a laptop on a glowing
 * platform with the assignment document (and a green approval check) lifting
 * out of the screen, ringed by floating glass action labels (Research / Write /
 * Submit) and academic props (open book, plant, stacked books, mug). Sub-groups
 * parallax toward the cursor and drift on gentle loops. Navy + electric blue.
 */
export function HeroIllustration({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const deskX = useTransform(mx, [-0.5, 0.5], [-6, 6]);
  const deskY = useTransform(my, [-0.5, 0.5], [-5, 5]);
  const docX = useTransform(mx, [-0.5, 0.5], [-14, 14]);
  const docY = useTransform(my, [-0.5, 0.5], [-11, 11]);
  const chipAX = useTransform(mx, [-0.5, 0.5], [-26, 26]);
  const chipAY = useTransform(my, [-0.5, 0.5], [-20, 20]);
  const chipBX = useTransform(mx, [-0.5, 0.5], [24, -24]);
  const chipBY = useTransform(my, [-0.5, 0.5], [18, -18]);
  const chipCX = useTransform(mx, [-0.5, 0.5], [30, -30]);
  const chipCY = useTransform(my, [-0.5, 0.5], [-16, 16]);

  const floatSlow = {
    animate: { y: [0, -10, 0] },
    transition: {
      duration: 5.5,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  };

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <svg viewBox="0 0 520 460" className="h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="platform" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0b1428" />
          </linearGradient>
        </defs>

        {/* Glowing platform */}
        <ellipse
          cx="260"
          cy="372"
          rx="200"
          ry="42"
          fill="#3b82f6"
          opacity="0.08"
        />
        <ellipse
          cx="260"
          cy="372"
          rx="200"
          ry="42"
          fill="none"
          stroke="url(#platform)"
          strokeWidth="2"
        />
        <ellipse
          cx="260"
          cy="372"
          rx="150"
          ry="30"
          fill="none"
          stroke="url(#platform)"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Ambient sparkles */}
        {[
          [70, 120],
          [450, 90],
          [430, 250],
          [90, 300],
          [250, 60],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2" fill="#93c5fd" opacity="0.7" />
        ))}

        {/* ---- Props behind laptop ---- */}
        {/* Open book (top) */}
        <motion.g
          {...floatSlow}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path d="M170 92 L232 78 L232 116 L170 128 Z" fill="#c7d2fe" />
          <path d="M294 92 L232 78 L232 116 L294 128 Z" fill="#a5b4fc" />
          <path d="M232 78 L232 116" stroke="#6366f1" strokeWidth="2" />
          <path
            d="M178 100 L224 90 M178 108 L224 98"
            stroke="#8b93d6"
            strokeWidth="1.5"
          />
          <path
            d="M286 100 L240 90 M286 108 L240 98"
            stroke="#7c83c9"
            strokeWidth="1.5"
          />
        </motion.g>

        {/* ---- Laptop (bob) ---- */}
        <motion.g
          style={{ x: deskX, y: deskY }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        >
          {/* Plant (left) */}
          <path d="M96 322 L124 322 L119 352 L101 352 Z" fill="#1e3a8a" />
          <path
            d="M110 322 C104 300 92 296 88 302 C96 308 100 316 110 322 Z"
            fill="#3b82f6"
          />
          <path
            d="M110 322 C116 298 128 296 132 304 C122 308 116 314 110 322 Z"
            fill="#60a5fa"
          />
          <path
            d="M110 322 C110 296 110 288 110 288 C114 300 112 312 110 322 Z"
            fill="#93c5fd"
          />

          {/* Screen */}
          <rect
            x="150"
            y="150"
            width="220"
            height="150"
            rx="12"
            fill="#0e1730"
            stroke="#2b3a63"
            strokeWidth="3"
          />
          <rect
            x="162"
            y="162"
            width="196"
            height="126"
            rx="6"
            fill="url(#screen)"
          />
          {/* Hinge + keyboard base */}
          <rect x="150" y="296" width="220" height="8" rx="3" fill="#1b2a4d" />
          <path
            d="M120 300 L400 300 L428 342 Q431 348 423 348 L97 348 Q89 348 92 342 Z"
            fill="#152239"
          />
          <path d="M120 300 L400 300 L410 316 L110 316 Z" fill="#1d2b4a" />
          <rect x="232" y="322" width="56" height="10" rx="4" fill="#22304f" />

          {/* Stacked books (right) */}
          <rect
            x="392"
            y="316"
            width="64"
            height="12"
            rx="3"
            fill="#6366f1"
            transform="rotate(-3 424 322)"
          />
          <rect
            x="398"
            y="306"
            width="58"
            height="12"
            rx="3"
            fill="#3b82f6"
            transform="rotate(2 427 312)"
          />
          <rect
            x="402"
            y="296"
            width="50"
            height="12"
            rx="3"
            fill="#60a5fa"
            transform="rotate(-2 427 302)"
          />

          {/* Mug (right) */}
          <rect x="430" y="330" width="34" height="26" rx="6" fill="#2563eb" />
          <path
            d="M464 336 q12 0 12 8 t-12 8"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
          />
          <ellipse cx="447" cy="332" rx="15" ry="4" fill="#1d4ed8" />
        </motion.g>

        {/* ---- Assignment document lifting out (parallax) ---- */}
        <motion.g style={{ x: docX, y: docY }}>
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transform="rotate(-5 285 205)"
          >
            <rect
              x="212"
              y="116"
              width="150"
              height="180"
              rx="10"
              fill="#ffffff"
            />
            <rect
              x="212"
              y="116"
              width="150"
              height="180"
              rx="10"
              fill="url(#screen)"
              opacity="0.04"
            />
            <text
              x="228"
              y="146"
              fill="#2563eb"
              fontSize="16"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              ASSIGNMENT
            </text>
            <line
              x1="228"
              y1="162"
              x2="346"
              y2="162"
              stroke="#cbd5e1"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="228"
              y1="174"
              x2="330"
              y2="174"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Image placeholder */}
            <rect
              x="228"
              y="196"
              width="52"
              height="40"
              rx="5"
              fill="#dbeafe"
            />
            <path d="M236 226 l10 -12 l8 8 l6 -6 l8 10 Z" fill="#93c5fd" />
            <circle cx="240" cy="208" r="4" fill="#93c5fd" />
            <line
              x1="292"
              y1="200"
              x2="346"
              y2="200"
              stroke="#cbd5e1"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="292"
              y1="212"
              x2="340"
              y2="212"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="292"
              y1="224"
              x2="344"
              y2="224"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="228"
              y1="256"
              x2="346"
              y2="256"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="228"
              y1="268"
              x2="322"
              y2="268"
              stroke="#e2e8f0"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </motion.g>
          {/* Green approval check */}
          <motion.g
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle cx="356" cy="276" r="21" fill="#10b981" />
            <circle
              cx="356"
              cy="276"
              r="21"
              fill="none"
              stroke="#34d399"
              strokeWidth="3"
              opacity="0.5"
            />
            <path
              d="M347 276 l6 6 l11 -13"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.g>
      </svg>

      {/* ---- Floating glass action labels (HTML overlay) ---- */}
      <motion.div
        style={{ x: chipAX, y: chipAY }}
        className="absolute top-[3%] right-[0%]"
      >
        <motion.div {...floatSlow}>
          <ChipLabel icon={<Search className="size-4" />} label="Research" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: chipBX, y: chipBY }}
        className="absolute top-[36%] left-[-2%]"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        >
          <ChipLabel icon={<Pencil className="size-4" />} label="Write" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ x: chipCX, y: chipCY }}
        className="absolute top-[54%] right-[1%]"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        >
          <ChipLabel icon={<Upload className="size-4" />} label="Submit" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ChipLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-blue-400/25 bg-white/[0.07] px-3.5 py-2 text-sm font-medium text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <span className="text-blue-300">{icon}</span>
      {label}
    </div>
  );
}
