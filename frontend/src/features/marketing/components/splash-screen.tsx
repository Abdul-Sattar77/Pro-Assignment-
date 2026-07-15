"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandMark } from "./brand-mark";

const WORDMARK = "PROSSIGNMENT";
const SEEN_KEY = "pross_splash_seen";
const DURATION_MS = 3000;

/**
 * Cinematic brand splash. On the first visit of a session the site is masked by
 * a full-screen overlay while the Prossignment crystal draws itself in, the
 * wordmark rises letter by letter, and the tagline fades — then the whole thing
 * lifts away to reveal the site. Shown once per session (sessionStorage).
 */
export function SplashScreen() {
  // Start "pending" so the very first server/client paint already covers the
  // site (no flash of content underneath), then decide in the effect.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Returning visitors this session skip the show (near-zero delay).
    const seen = window.sessionStorage.getItem(SEEN_KEY);
    const timer = window.setTimeout(
      () => {
        window.sessionStorage.setItem(SEEN_KEY, "1");
        setVisible(false);
      },
      seen ? 0 : DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-[#080a1f]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Ambient glow */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 45% at 50% 42%, rgba(213,179,107,0.16), transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />

          {/* Crystal mark */}
          <motion.div
            className="relative text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 blur-2xl"
              style={{ color: "#d5b36b" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3] }}
              transition={{ duration: 2, times: [0, 0.7, 1] }}
            >
              <BrandMark className="h-40 w-40 sm:h-48 sm:w-48" />
            </motion.div>
            <BrandMark draw className="h-40 w-40 sm:h-48 sm:w-48" />
          </motion.div>

          {/* Wordmark — letter by letter */}
          <div className="mt-8 flex overflow-hidden" aria-label={WORDMARK}>
            {WORDMARK.split("").map((letter, index) => (
              <motion.span
                key={index}
                className="font-display text-2xl font-light tracking-[0.35em] text-white sm:text-3xl"
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: 1.35 + index * 0.05,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Tagline */}
          <motion.p
            className="mt-3 font-mono text-[10px] tracking-[0.4em] text-white/55 uppercase sm:text-xs"
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            The pros for your assignments
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
