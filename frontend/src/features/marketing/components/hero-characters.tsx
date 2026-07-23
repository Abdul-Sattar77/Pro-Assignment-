"use client";

import { motion } from "framer-motion";

/**
 * Young-adult university-student characters for the hero gutters — modern flat
 * illustration with adult proportions (small head, long body), hoodie/gown,
 * glasses, laptop/diploma, and a minimal mature face. Each floats and has idle
 * motion (wave / tassel / blink) plus cursor parallax (handled by the parent).
 * Pure SVG, no external asset.
 */

const skinDefs = (
  <radialGradient id="skin" cx="42%" cy="34%" r="72%">
    <stop offset="0%" stopColor="#f4c9a0" />
    <stop offset="100%" stopColor="#e3a878" />
  </radialGradient>
);

/** Minimal, mature face (no blush). Optionally with glasses. */
function Face({
  glasses = false,
  mouth = "#9c5a3c",
}: {
  glasses?: boolean;
  mouth?: string;
}) {
  return (
    <>
      {/* brows */}
      <path
        d="M63 52 Q68 50 73 52"
        stroke="#6b4a35"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M77 52 Q82 50 87 52"
        stroke="#6b4a35"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* blinking eyes */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{
          duration: 5,
          times: [0, 0.9, 0.94, 0.98, 1],
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <circle cx="68" cy="58" r="2.6" fill="#2b2b2b" />
        <circle cx="82" cy="58" r="2.6" fill="#2b2b2b" />
      </motion.g>
      {glasses && (
        <g stroke="#1f2937" strokeWidth="2" fill="none">
          <rect x="61" y="53" width="14" height="11" rx="4" />
          <rect x="75" y="53" width="14" height="11" rx="4" />
          <line x1="75" y1="57" x2="75" y2="57" />
          <path d="M75 57 h0" />
          <line x1="61" y1="56" x2="55" y2="55" />
          <line x1="89" y1="56" x2="95" y2="55" />
        </g>
      )}
      {/* smile */}
      <path
        d="M71 66 Q75 70 79 66"
        stroke={mouth}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** University student — hoodie, glasses, backpack, holding a laptop; waving. */
export function StudentMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 150 300"
      className={className}
      aria-hidden
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5.6, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        {skinDefs}
        <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9bff" />
          <stop offset="100%" stopColor="#3b5bdb" />
        </linearGradient>
        <linearGradient id="jeans" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334970" />
          <stop offset="100%" stopColor="#22314f" />
        </linearGradient>
      </defs>

      <ellipse cx="75" cy="289" rx="40" ry="7" fill="#000" opacity="0.12" />

      {/* legs */}
      <rect x="61" y="176" width="13" height="98" rx="6.5" fill="url(#jeans)" />
      <rect x="76" y="176" width="13" height="98" rx="6.5" fill="url(#jeans)" />
      {/* shoes */}
      <path d="M54 272 h20 v8 q0 5 -5 5 h-15 q-4 0 -4 -4 z" fill="#e5e7eb" />
      <path d="M76 272 h20 v9 q0 4 -4 4 h-16 q-5 0 -5 -5 z" fill="#e5e7eb" />

      {/* torso — hoodie */}
      <path
        d="M50 100 q0 -14 14 -16 h22 q14 2 14 16 v66 q0 12 -12 12 H62 q-12 0 -12 -12 z"
        fill="url(#hoodie)"
        stroke="#31489f"
        strokeWidth="1.5"
      />
      {/* hood */}
      <path
        d="M60 90 q15 12 30 0 l-3 12 q-12 8 -24 0 z"
        fill="#31489f"
        opacity="0.55"
      />
      {/* pocket */}
      <path
        d="M60 150 h30 v14 q0 4 -4 4 H64 q-4 0 -4 -4 z"
        fill="#31489f"
        opacity="0.4"
      />
      {/* drawstrings */}
      <line x1="70" y1="98" x2="69" y2="120" stroke="#dbe4ff" strokeWidth="2" />
      <line x1="80" y1="98" x2="81" y2="120" stroke="#dbe4ff" strokeWidth="2" />
      {/* backpack strap */}
      <path
        d="M64 92 L86 176"
        stroke="#1f2937"
        strokeWidth="6"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* left arm holding laptop */}
      <rect
        x="40"
        y="120"
        width="14"
        height="44"
        rx="7"
        fill="url(#hoodie)"
        transform="rotate(14 47 126)"
      />
      <g transform="rotate(-6 55 165)">
        <rect x="30" y="150" width="46" height="30" rx="4" fill="#cbd5e1" />
        <rect x="33" y="153" width="40" height="22" rx="2" fill="#1e293b" />
        <rect x="36" y="156" width="18" height="3" rx="1.5" fill="#5b9bff" />
        <rect x="36" y="162" width="30" height="2.5" rx="1.25" fill="#475569" />
        <rect x="36" y="167" width="24" height="2.5" rx="1.25" fill="#475569" />
      </g>
      <circle cx="42" cy="164" r="8" fill="url(#skin)" />

      {/* waving arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, 18, -3, 18, 0] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.6,
        }}
      >
        <rect
          x="94"
          y="104"
          width="14"
          height="46"
          rx="7"
          fill="url(#hoodie)"
          transform="rotate(-24 101 147)"
        />
        <circle cx="118" cy="108" r="8" fill="url(#skin)" />
      </motion.g>

      {/* neck + head */}
      <rect x="69" y="78" width="12" height="14" rx="5" fill="url(#skin)" />
      <circle cx="49" cy="60" r="5" fill="url(#skin)" />
      <circle cx="101" cy="60" r="5" fill="url(#skin)" />
      <circle
        cx="75"
        cy="58"
        r="24"
        fill="url(#skin)"
        stroke="#d99a68"
        strokeWidth="1.3"
      />
      <ellipse cx="66" cy="46" rx="9" ry="6" fill="#fff" opacity="0.16" />
      {/* modern hair */}
      <path
        d="M51 56 Q49 30 75 30 Q101 30 99 56 Q96 44 84 41 Q88 36 75 36 Q62 36 66 41 Q54 44 51 56 Z"
        fill="#3d2a1e"
      />
      <Face glasses />
    </motion.svg>
  );
}

/** Graduate — cap & gown, diploma; waving. Adult proportions. */
export function GraduateMascot({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 150 300"
      className={className}
      aria-hidden
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      <defs>
        {skinDefs}
        <linearGradient id="gown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9d7bf0" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      <ellipse cx="75" cy="289" rx="42" ry="7" fill="#000" opacity="0.12" />

      {/* legs */}
      <rect x="61" y="182" width="13" height="92" rx="6.5" fill="#2c2748" />
      <rect x="76" y="182" width="13" height="92" rx="6.5" fill="#2c2748" />
      <path d="M54 272 h20 v8 q0 5 -5 5 h-15 q-4 0 -4 -4 z" fill="#1f2937" />
      <path d="M76 272 h20 v9 q0 4 -4 4 h-16 q-5 0 -5 -5 z" fill="#1f2937" />

      {/* gown */}
      <path
        d="M48 100 q0 -14 14 -16 h26 q14 2 14 16 v78 q0 10 -10 10 H58 q-10 0 -10 -10 z"
        fill="url(#gown)"
        stroke="#5b21b6"
        strokeWidth="1.5"
      />
      <path d="M75 96 L88 188 L62 188 Z" fill="#5b21b6" opacity="0.5" />
      {/* stole */}
      <path
        d="M64 92 L70 178 M86 92 L80 178"
        stroke="#facc15"
        strokeWidth="7"
        opacity="0.9"
        strokeLinecap="round"
      />

      {/* left arm holding diploma */}
      <rect
        x="42"
        y="118"
        width="14"
        height="44"
        rx="7"
        fill="url(#gown)"
        transform="rotate(18 49 124)"
      />
      <g transform="rotate(-12 50 164)">
        <rect x="26" y="160" width="48" height="12" rx="6" fill="#fef3c7" />
        <rect x="26" y="160" width="8" height="12" rx="4" fill="#ef4444" />
        <rect x="66" y="160" width="8" height="12" rx="4" fill="#ef4444" />
      </g>
      <circle cx="46" cy="164" r="8" fill="url(#skin)" />

      {/* waving arm */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
        animate={{ rotate: [0, -3, 18, -3, 0] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1.2,
        }}
      >
        <rect
          x="94"
          y="102"
          width="14"
          height="46"
          rx="7"
          fill="url(#gown)"
          transform="rotate(-26 101 145)"
        />
        <circle cx="119" cy="106" r="8" fill="url(#skin)" />
      </motion.g>

      {/* neck + head */}
      <rect x="69" y="78" width="12" height="14" rx="5" fill="url(#skin)" />
      <circle cx="49" cy="60" r="5" fill="url(#skin)" />
      <circle cx="101" cy="60" r="5" fill="url(#skin)" />
      <circle
        cx="75"
        cy="58"
        r="24"
        fill="url(#skin)"
        stroke="#d99a68"
        strokeWidth="1.3"
      />
      {/* hair under cap */}
      <path
        d="M52 58 Q51 40 75 40 Q99 40 98 58 Q92 50 75 50 Q58 50 52 58 Z"
        fill="#241a12"
      />
      {/* mortarboard */}
      <rect x="64" y="30" width="22" height="10" rx="3" fill="#141a26" />
      <path
        d="M47 30 L75 20 L103 30 L75 40 Z"
        fill="#1f2937"
        stroke="#0b1120"
        strokeWidth="1.4"
      />
      <circle cx="75" cy="30" r="2.4" fill="#facc15" />
      {/* tassel */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "left top" }}
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
      >
        <path
          d="M75 30 Q99 30 101 36 L101 52"
          stroke="#facc15"
          strokeWidth="2.4"
          fill="none"
        />
        <rect x="98" y="50" width="6" height="6" rx="1" fill="#facc15" />
        <circle cx="101" cy="58" r="4" fill="#eab308" />
      </motion.g>
      <Face mouth="#8a4f36" />
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

/** Small floating coffee-cup prop (late-night study fuel). */
export function PencilProp({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 56 64"
      className={className}
      aria-hidden
      animate={{ y: [0, -11, 0], rotate: [6, -6, 6] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
    >
      {/* steam */}
      <path
        d="M22 8 q4 -6 0 -12"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 8 q4 -6 0 -12"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* cup */}
      <path
        d="M12 18 h32 l-4 34 q-1 6 -7 6 H23 q-6 0 -7 -6 z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      <path d="M13 22 h30 l-1 8 H14 z" fill="#3b82f6" />
      <path
        d="M44 24 q10 0 10 9 q0 9 -11 9 l1 -5 q5 0 5 -4 q0 -4 -5 -4 z"
        fill="#94a3b8"
      />
    </motion.svg>
  );
}
