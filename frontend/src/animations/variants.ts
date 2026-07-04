import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion primitives. Mirrors the motion tokens in
 * docs/design-system/design-system.md §11. Reuse these — do not redefine
 * motion per feature. All consumers should honor `prefers-reduced-motion`.
 */
export const motionDuration = {
  fast: 0.12,
  base: 0.2,
  modal: 0.24,
  page: 0.26,
} as const;

/** Premium ease-out curve used across the app. */
export const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.base, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.page, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: motionDuration.fast, ease: easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionDuration.modal, ease: easeOut },
  },
};
