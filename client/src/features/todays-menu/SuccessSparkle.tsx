import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SparkleIcon } from "../../components/icons";

interface SuccessSparkleProps {
  /** Whether this reveal is a genuinely fresh generation — pass `false` for a reopened
   * Favorite/History recipe so revisiting an old pick never replays the celebration. */
  active: boolean;
}

const VISIBLE_MS = 1400;

/**
 * A small, one-time celebratory accent next to the "Today's Menu" eyebrow when a recipe
 * has just been freshly generated — driven by a plain mount-timeout, and `RecipeReveal`
 * remounts per `recipe.id`, so each new generation naturally gets its own fresh play.
 * Reduced motion still shows/hides it, just via an opacity-only fade.
 */
export function SuccessSparkle({ active }: SuccessSparkleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || !visible) return null;

  return (
    <motion.span
      role="status"
      aria-label="Freshly made for you"
      className="pointer-events-none absolute -right-1 -top-1 text-brand-accent"
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.3 }
          : { duration: 0.5, ease: "easeOut", scale: { type: "spring", stiffness: 320, damping: 14 } }
      }
    >
      <SparkleIcon width={18} height={18} />
    </motion.span>
  );
}
