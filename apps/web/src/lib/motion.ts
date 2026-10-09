/**
 * Soft Graphite Framer Motion Presets
 * Standard, predictable easing and duration tokens
 */

export const ease = {
  out: [0.22, 1, 0.36, 1],
  standard: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: ease.out } },
};

export const stagger = {
  show: { transition: { staggerChildren: 0.04 } },
};

export const press = {
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 420, damping: 32 },
};

export const panel = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.32, ease: ease.out } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.2, ease: ease.in } },
};

export const modal = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: ease.out } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: ease.in } },
};
