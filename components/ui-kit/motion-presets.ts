/**
 * Motion animation presets ported from core-clarity-system
 * Use these for consistent stagger animations across pages
 */

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 }
};

export const fastContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export const tapScale = {
  whileTap: { scale: 0.95 }
};

export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30
};
