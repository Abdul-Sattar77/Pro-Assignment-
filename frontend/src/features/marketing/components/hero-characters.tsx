"use client";

import { motion } from "framer-motion";

/**
 * Hand-built flat-vector cartoon characters for the hero gutters. Each one
 * floats, and has its own idle motion (wave / tassel sway) plus a blink. Pure
 * SVG — no external asset. `transformBox: fill-box` makes the rotate origins
 * behave predictably inside the SVG.
 */

const SKIN = "#ffcc9c";
const SKIN_SHADOW = "#f0b483";

function Face({ smileColor = "#7a4a30" }: { smileColor?: string }) {
  return (
    <>
      {/* blinking eyes */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scaleY: [1, 1, 0.15, 1, 1] }}
        transition={{
          duration: 4.5,
          times: [0, 0.9, 0.94, 0.98, 1],
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <ellipse cx="75" cy="60" rx="3.2" ry="4.6" fill="#2b2b2b" />
        <ellipse cx="95" cy="60" rx="3.2" ry="4.6" fill="#2b2b2b" />
      </motion.g>
      {/* cheeks */}
      <circle cx="67" cy="70" r="5" fill="#ff9db0" opacity="0.55" />
      <circle cx="103" cy="70" r="5" fill="#ff9db0" opacity="0.55" />
      {/* smile */}
      <path
        d="M76 70 Q85 79 94 70"
        stroke={smileColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** Student holding an open book, waving hello. */
export function StudentMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 170 205"
      className={className}
      aria-hidden
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
    >
      <ellipse cx="85" cy="196" rx="38" ry="7" fill="#000" opacity="0.14" />
      {/* legs */}
      <rect x="71" y="150" width="12" height="40" rx="6" fill="#1e293b" />
      <rect x="88" y="150" width="12" height="40" rx="6" fill="#1e293b" />
      <ellipse cx="73" cy="190" rx="11" ry="6" fill="#0f172a" />
      <ellipse cx="98" cy="190" rx="11" ry="6" fill="#0f172a" />
      {/* torso */}
      <rect x="57" y="94" width="56" height="66" rx="27" fill="#3b82f6" />
      <rect x="57" y="128" width="56" height="32" rx="16" fill="#2f6fd6" />
      {/* left arm holding book */}
      <rect
        x="44"
        y="112"
        width="15"
        height="44"
        rx="7.5"
        fill="#3b82f6"
        transform="rotate(16 51 118)"
      />
      {/* book */}
      <g transform="rotate(-7 60 148)">
        <rect x="33" y="128" width="54" height="36" rx="4" fill="#6366f1" />
        <rect x="37" y="132" width="46" height="28" rx="2" fill="#ffffff" />
        <line
          x1="60"
          y1="132"
          x2="60"
          y2="160"
          stroke="#c7d2fe"
          strokeWidth="2"
        />
        <line
          x1="43"
          y1="140"
          x2="56"
          y2="140"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="43"
          y1="147"
          x2="56"
          y2="147"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="64"
          y1="140"
          x2="77"
          y2="140"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="64"
          y1="147"
          x2="77"
          y2="147"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
      </g>
      <circle cx="47" cy="150" r="8.5" fill={SKIN} />
      {/* waving right arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, 18, -4, 18, 0] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.6,
        }}
      >
        <rect
          x="103"
          y="96"
          width="15"
          height="46"
          rx="7.5"
          fill="#3b82f6"
          transform="rotate(-26 110 138)"
        />
        <circle cx="128" cy="102" r="8.5" fill={SKIN} />
      </motion.g>
      {/* head */}
      <circle cx="55" cy="64" r="6" fill={SKIN_SHADOW} />
      <circle cx="115" cy="64" r="6" fill={SKIN_SHADOW} />
      <circle cx="85" cy="62" r="31" fill={SKIN} />
      {/* hair */}
      <path
        d="M53 58 Q50 27 85 27 Q120 27 117 58 Q108 43 85 43 Q62 43 53 58 Z"
        fill="#4b3527"
      />
      <Face />
    </motion.svg>
  );
}

/** Graduate in a cap, holding a diploma, thumbs-up. */
export function GraduateMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 170 205"
      className={className}
      aria-hidden
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      <ellipse cx="85" cy="196" rx="38" ry="7" fill="#000" opacity="0.14" />
      {/* legs */}
      <rect x="71" y="150" width="12" height="40" rx="6" fill="#312e46" />
      <rect x="88" y="150" width="12" height="40" rx="6" fill="#312e46" />
      <ellipse cx="73" cy="190" rx="11" ry="6" fill="#1e1b2e" />
      <ellipse cx="98" cy="190" rx="11" ry="6" fill="#1e1b2e" />
      {/* gown */}
      <rect x="57" y="94" width="56" height="66" rx="27" fill="#8b5cf6" />
      <path d="M85 96 L96 160 L74 160 Z" fill="#7c4ddb" />
      {/* left arm holding diploma */}
      <rect
        x="46"
        y="110"
        width="15"
        height="44"
        rx="7.5"
        fill="#8b5cf6"
        transform="rotate(20 53 116)"
      />
      <g transform="rotate(-14 52 150)">
        <rect x="30" y="146" width="46" height="12" rx="6" fill="#fef3c7" />
        <rect x="30" y="146" width="8" height="12" rx="4" fill="#fbbf24" />
        <rect x="68" y="146" width="8" height="12" rx="4" fill="#fbbf24" />
      </g>
      <circle cx="50" cy="150" r="8.5" fill={SKIN} />
      {/* waving right arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, -6, 16, -6, 0] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      >
        <rect
          x="103"
          y="94"
          width="15"
          height="46"
          rx="7.5"
          fill="#8b5cf6"
          transform="rotate(-28 110 136)"
        />
        <circle cx="129" cy="99" r="8.5" fill={SKIN} />
      </motion.g>
      {/* head */}
      <circle cx="55" cy="64" r="6" fill={SKIN_SHADOW} />
      <circle cx="115" cy="64" r="6" fill={SKIN_SHADOW} />
      <circle cx="85" cy="63" r="31" fill={SKIN} />
      <path
        d="M55 60 Q54 34 85 34 Q116 34 115 60 Q106 48 85 48 Q64 48 55 60 Z"
        fill="#2b2b2b"
      />
      {/* mortarboard */}
      <rect x="72" y="30" width="26" height="12" rx="3" fill="#1f2937" />
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "left top" }}
        animate={{ rotate: [0, 8, 0, -8, 0] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      >
        <path d="M85 26 L114 34 L85 26 Z" fill="none" />
        <line
          x1="85"
          y1="26"
          x2="114"
          y2="34"
          stroke="#1f2937"
          strokeWidth="0"
        />
      </motion.g>
      <path d="M55 30 L85 20 L115 30 L85 40 Z" fill="#111827" />
      {/* tassel */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "left top" }}
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
      >
        <line
          x1="85"
          y1="30"
          x2="110"
          y2="34"
          stroke="#fbbf24"
          strokeWidth="2.5"
        />
        <line
          x1="110"
          y1="34"
          x2="111"
          y2="52"
          stroke="#fbbf24"
          strokeWidth="2.5"
        />
        <circle cx="111" cy="55" r="4" fill="#f59e0b" />
      </motion.g>
      <Face smileColor="#8a5a3a" />
    </motion.svg>
  );
}

/** Small floating book prop (SVG, not emoji). */
export function BookProp({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 56"
      className={className}
      aria-hidden
      animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
    >
      <rect x="6" y="10" width="52" height="38" rx="5" fill="#22c55e" />
      <rect x="10" y="14" width="44" height="30" rx="3" fill="#ffffff" />
      <line x1="32" y1="14" x2="32" y2="44" stroke="#bbf7d0" strokeWidth="3" />
      <line
        x1="15"
        y1="22"
        x2="28"
        y2="22"
        stroke="#cbd5e1"
        strokeWidth="2.5"
      />
      <line
        x1="15"
        y1="29"
        x2="28"
        y2="29"
        stroke="#cbd5e1"
        strokeWidth="2.5"
      />
      <line
        x1="36"
        y1="22"
        x2="49"
        y2="22"
        stroke="#cbd5e1"
        strokeWidth="2.5"
      />
      <line
        x1="36"
        y1="29"
        x2="49"
        y2="29"
        stroke="#cbd5e1"
        strokeWidth="2.5"
      />
    </motion.svg>
  );
}

/** Small floating pencil prop. */
export function PencilProp({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 40 90"
      className={className}
      aria-hidden
      animate={{ y: [0, -12, 0], rotate: [8, -8, 8] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      <rect x="13" y="18" width="14" height="52" fill="#fbbf24" />
      <rect x="13" y="18" width="14" height="52" rx="0" fill="#fbbf24" />
      <polygon points="13,70 27,70 20,86" fill="#f5deb3" />
      <polygon points="16,80 24,80 20,86" fill="#1f2937" />
      <rect x="13" y="8" width="14" height="12" rx="2" fill="#ef4444" />
      <rect x="13" y="6" width="14" height="5" rx="2" fill="#e5e7eb" />
    </motion.svg>
  );
}
