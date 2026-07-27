"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Smooth-scroll handler for the marketing site. Mounted only in public layout.
 * Uses native CSS smooth scrolling and handles anchor links cleanly without external bundle dependencies.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";

    return () => {
      html.style.scrollBehavior = prevBehavior;
    };
  }, []);

  return <>{children}</>;
}
