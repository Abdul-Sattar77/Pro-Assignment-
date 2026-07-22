"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Slim gradient progress bar pinned to the top of the viewport that fills as
 * the visitor scrolls the page. Pure transform (scaleX) — cheap and smooth.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-linear-to-r from-violet-500 via-blue-400 to-fuchsia-500"
    />
  );
}
