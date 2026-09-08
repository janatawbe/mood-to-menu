import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SparkleIcon } from "../../components/icons";

interface SuccessSparkleProps {
  /** Whether this recipe reveal is a genuinely fresh generation — pass `false` for a
   * reopened Favorite/History recipe (Milestone 9, Step 13/17) so re-visiting an old
   * pick never replays a "just made this for you" celebration it didn't earn. */
  active: boolean;
}

const VISIBLE_MS = 1400;

/**
 * A small, one-time celebratory accent next to the "Today's Menu" eyebrow when a recipe
 * has just been freshly generated — never repeats while viewing the same recipe (it's
 * driven by a plain mount-timeout, and the whole `RecipeReveal` tree already remounts
 * per `recipe.id`, so a new generation naturally gets its own fresh play). Under reduced
 * motion it still appears and disappears, just via a plain opacity fade with no scale or
 * movement, matching the same "reduced motion still gets an opacity-only cue" pattern
 * used by ChefMascot's ReadyToHelpCloud.
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
