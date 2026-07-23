"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Buttery inertial smooth-scroll for the marketing site (Lenis). Mounted only
 * in the public layout — the app portal keeps native scrolling. Respects
 * prefers-reduced-motion and drives anchor links (#services) through Lenis.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
