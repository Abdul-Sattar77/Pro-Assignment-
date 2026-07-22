"use client";

import { motion } from "framer-motion";

/**
 * Hand-built flat-vector cartoon characters for the hero gutters — upgraded to
 * a polished "SaaS illustration" look with gradients, soft shading, outlined
 * silhouettes and highlights. Each floats and has idle motion (wave / tassel /
 * blink). Pure SVG, no external asset. `transformBox: fill-box` keeps rotate
 * origins predictable inside the SVG.
 */

function Face({ mouth = "#b4694a" }: { mouth?: string }) {
  return (
    <>
      {/* brows */}
      <path
        d="M67 51 Q73 48 79 51"
        stroke="#7a4a30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M91 51 Q97 48 103 51"
        stroke="#7a4a30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* blinking eyes */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
        transition={{
          duration: 4.5,
          times: [0, 0.9, 0.94, 0.98, 1],
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <ellipse cx="73" cy="60" rx="3.4" ry="5" fill="#2b2b2b" />
        <ellipse cx="97" cy="60" rx="3.4" ry="5" fill="#2b2b2b" />
        <circle cx="74.4" cy="58.4" r="1.3" fill="#fff" />
        <circle cx="98.4" cy="58.4" r="1.3" fill="#fff" />
      </motion.g>
      {/* cheeks */}
      <circle cx="65" cy="70" r="5.5" fill="#ff8fa8" opacity="0.5" />
      <circle cx="105" cy="70" r="5.5" fill="#ff8fa8" opacity="0.5" />
      {/* smile */}
      <path
        d="M76 70 Q85 80 94 70"
        stroke={mouth}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** Shared head with skin gradient, ears, highlight. */
function Head() {
  return (
    <>
      <circle cx="55" cy="65" r="6.5" fill="url(#skin)" />
      <circle cx="115" cy="65" r="6.5" fill="url(#skin)" />
      <circle
        cx="85"
        cy="62"
        r="32"
        fill="url(#skin)"
        stroke="#e8a877"
        strokeWidth="1.5"
      />
      <ellipse cx="74" cy="48" rx="12" ry="8" fill="#fff" opacity="0.18" />
    </>
  );
}

const skinDefs = (
  <>
    <radialGradient id="skin" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stopColor="#ffd9b0" />
      <stop offset="100%" stopColor="#f6b787" />
    </radialGradient>
  </>
);

/** Student holding a book, waving hello. */
export function StudentMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 170 210"
      className={className}
      aria-hidden
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        {skinDefs}
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="hairS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b3b2a" />
          <stop offset="100%" stopColor="#3d2519" />
        </linearGradient>
      </defs>

      <ellipse cx="85" cy="200" rx="40" ry="7" fill="#000" opacity="0.12" />
      {/* legs */}
      <rect x="70" y="150" width="13" height="42" rx="6.5" fill="#334155" />
      <rect x="87" y="150" width="13" height="42" rx="6.5" fill="#334155" />
      <ellipse cx="72" cy="193" rx="12" ry="6" fill="#1e293b" />
      <ellipse cx="98" cy="193" rx="12" ry="6" fill="#1e293b" />
      {/* torso */}
      <rect
        x="55"
        y="93"
        width="60"
        height="68"
        rx="28"
        fill="url(#shirt)"
        stroke="#3b5bdb"
        strokeWidth="1.5"
      />
      <path
        d="M85 93 Q77 104 85 112 Q93 104 85 93 Z"
        fill="#3b5bdb"
        opacity="0.5"
      />
      <ellipse cx="70" cy="112" rx="8" ry="14" fill="#fff" opacity="0.12" />
      {/* left arm + book */}
      <rect
        x="43"
        y="112"
        width="16"
        height="46"
        rx="8"
        fill="url(#shirt)"
        transform="rotate(15 51 118)"
      />
      <g transform="rotate(-7 60 150)">
        <rect
          x="31"
          y="128"
          width="56"
          height="38"
          rx="5"
          fill="#6366f1"
          stroke="#4f46e5"
          strokeWidth="1.5"
        />
        <rect x="35" y="132" width="48" height="30" rx="2" fill="#f8fafc" />
        <line
          x1="59"
          y1="132"
          x2="59"
          y2="162"
          stroke="#c7d2fe"
          strokeWidth="2.5"
        />
        <line
          x1="41"
          y1="141"
          x2="55"
          y2="141"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="41"
          y1="148"
          x2="55"
          y2="148"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="63"
          y1="141"
          x2="77"
          y2="141"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <line
          x1="63"
          y1="148"
          x2="77"
          y2="148"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
      </g>
      <circle
        cx="47"
        cy="152"
        r="9"
        fill="url(#skin)"
        stroke="#e8a877"
        strokeWidth="1.2"
      />
      {/* waving arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, 20, -3, 20, 0] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.6,
        }}
      >
        <rect
          x="104"
          y="95"
          width="16"
          height="48"
          rx="8"
          fill="url(#shirt)"
          transform="rotate(-26 112 139)"
        />
        <circle
          cx="130"
          cy="101"
          r="9"
          fill="url(#skin)"
          stroke="#e8a877"
          strokeWidth="1.2"
        />
      </motion.g>

      <Head />
      {/* hair */}
      <path
        d="M52 60 Q49 26 85 26 Q121 26 118 60 Q113 47 100 44 Q104 52 96 52 Q94 44 85 44 Q76 44 74 52 Q66 52 70 44 Q57 47 52 60 Z"
        fill="url(#hairS)"
      />
      <Face />
    </motion.svg>
  );
}

/** Graduate in a cap, holding a diploma, waving. */
export function GraduateMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 170 210"
      className={className}
      aria-hidden
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        {skinDefs}
        <linearGradient id="gown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      <ellipse cx="85" cy="200" rx="40" ry="7" fill="#000" opacity="0.12" />
      {/* legs */}
      <rect x="70" y="150" width="13" height="42" rx="6.5" fill="#3b3560" />
      <rect x="87" y="150" width="13" height="42" rx="6.5" fill="#3b3560" />
      <ellipse cx="72" cy="193" rx="12" ry="6" fill="#241f3d" />
      <ellipse cx="98" cy="193" rx="12" ry="6" fill="#241f3d" />
      {/* gown */}
      <rect
        x="55"
        y="93"
        width="60"
        height="68"
        rx="28"
        fill="url(#gown)"
        stroke="#6d28d9"
        strokeWidth="1.5"
      />
      <path d="M85 95 L97 161 L73 161 Z" fill="#6d28d9" opacity="0.55" />
      <ellipse cx="70" cy="112" rx="8" ry="14" fill="#fff" opacity="0.12" />
      {/* left arm + diploma */}
      <rect
        x="45"
        y="110"
        width="16"
        height="46"
        rx="8"
        fill="url(#gown)"
        transform="rotate(19 53 116)"
      />
      <g transform="rotate(-13 52 152)">
        <rect x="28" y="148" width="48" height="12" rx="6" fill="#fef3c7" />
        <rect x="28" y="148" width="8" height="12" rx="4" fill="#fbbf24" />
        <rect x="68" y="148" width="8" height="12" rx="4" fill="#fbbf24" />
      </g>
      <circle
        cx="50"
        cy="152"
        r="9"
        fill="url(#skin)"
        stroke="#e8a877"
        strokeWidth="1.2"
      />
      {/* waving arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, -4, 18, -4, 0] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      >
        <rect
          x="104"
          y="93"
          width="16"
          height="48"
          rx="8"
          fill="url(#gown)"
          transform="rotate(-28 112 137)"
        />
        <circle
          cx="131"
          cy="98"
          r="9"
          fill="url(#skin)"
          stroke="#e8a877"
          strokeWidth="1.2"
        />
      </motion.g>

      <Head />
      {/* hair peeking under cap */}
      <path
        d="M55 62 Q54 40 85 40 Q116 40 115 62 Q108 52 85 52 Q62 52 55 62 Z"
        fill="#2b2b2b"
      />
      {/* mortarboard */}
      <rect x="73" y="30" width="24" height="11" rx="3" fill="#111827" />
      <path
        d="M53 30 L85 19 L117 30 L85 41 Z"
        fill="#1f2937"
        stroke="#0b1120"
        strokeWidth="1.5"
      />
      <ellipse cx="78" cy="27" rx="10" ry="3" fill="#374151" opacity="0.7" />
      <circle cx="85" cy="30" r="2.5" fill="#fbbf24" />
      {/* tassel */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "left top" }}
        animate={{ rotate: [0, 11, 0, -11, 0] }}
        transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
      >
        <path
          d="M85 30 Q108 30 111 36 L111 54"
          stroke="#fbbf24"
          strokeWidth="2.5"
          fill="none"
        />
        <circle cx="111" cy="57" r="4.5" fill="#f59e0b" />
        <rect x="108" y="52" width="6" height="6" rx="1" fill="#fbbf24" />
      </motion.g>
      <Face mouth="#a35c3f" />
    </motion.svg>
  );
}

/** Small floating book prop. */
export function BookProp({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 56"
      className={className}
      aria-hidden
      animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        <linearGradient id="bk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect
        x="6"
        y="10"
        width="52"
        height="38"
        rx="5"
        fill="url(#bk)"
        stroke="#047857"
        strokeWidth="1.5"
      />
      <rect x="10" y="14" width="44" height="30" rx="3" fill="#f8fafc" />
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
      <defs>
        <linearGradient id="pc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="13" y="18" width="14" height="52" fill="url(#pc)" />
      <polygon points="13,70 27,70 20,86" fill="#f5deb3" />
      <polygon points="16,80 24,80 20,86" fill="#1f2937" />
      <rect x="13" y="8" width="14" height="12" rx="2" fill="#ef4444" />
      <rect x="13" y="6" width="14" height="5" rx="2" fill="#e5e7eb" />
      <line
        x1="17"
        y1="18"
        x2="17"
        y2="70"
        stroke="#fff"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </motion.svg>
  );
}
