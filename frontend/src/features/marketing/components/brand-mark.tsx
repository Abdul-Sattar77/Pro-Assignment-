"use client";

import { motion } from "framer-motion";

/**
 * The Prossignment crystal — the faceted triangle from the brand logo, rebuilt
 * as vector geometry so it can draw itself in stroke by stroke. Used by the
 * splash screen and hero accent. Pass `draw` to animate the line-draw on mount.
 */

// viewBox 0 0 240 210 — apex top, base along the bottom.
const OUTER = "M120 16 L24 190 L216 190 Z";

/** Internal facet segments (crystalline interior), drawn after the outline. */
const FACETS: [number, number, number, number][] = [
  [120, 16, 120, 58], // apex → top inner
  [120, 58, 80, 92], // top inner → upper-left
  [120, 58, 150, 88], // top inner → upper-right
  [80, 92, 150, 88], // top crossbar
  [80, 92, 116, 104], // upper-left → center
  [150, 88, 116, 104], // upper-right → center
  [80, 92, 66, 128], // upper-left → left-lower
  [150, 88, 170, 126], // upper-right → right-lower
  [66, 128, 100, 150], // left-lower → center-lower-left
  [170, 126, 142, 150], // right-lower → center-lower-right
  [116, 104, 100, 150], // center → center-lower-left
  [116, 104, 142, 150], // center → center-lower-right
  [100, 150, 142, 150], // lower crossbar
  [66, 128, 24, 190], // left-lower → bottom-left
  [170, 126, 216, 190], // right-lower → bottom-right
  [100, 150, 120, 190], // center-lower-left → base mid
  [142, 150, 120, 190], // center-lower-right → base mid
];

export function BrandMark({
  className,
  draw = false,
}: {
  className?: string;
  draw?: boolean;
}) {
  return (
    <svg viewBox="0 0 240 210" fill="none" className={className} aria-hidden>
      <motion.path
        d={OUTER}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={draw ? { pathLength: 0, opacity: 0 } : false}
        animate={draw ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      {FACETS.map(([x1, y1, x2, y2], index) => (
        <motion.line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          animate={draw ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            delay: draw ? 0.5 + index * 0.055 : 0,
          }}
        />
      ))}
    </svg>
  );
}
