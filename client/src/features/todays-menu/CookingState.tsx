import { motion, useReducedMotion } from "motion/react";
import { ChefHatIcon } from "../../components/icons";

/** Shown if the user navigates to Today's Menu while the *initial* generation (from the
 * Vibe Check form) is still in flight and no recipe exists yet — distinct from the empty
 * state, since something genuinely is being cooked. */
export function CookingState() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div role="status" className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
      <motion.div
        className="text-brand-accent-strong"
        animate={prefersReducedMotion ? undefined : { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChefHatIcon width={44} height={44} />
      </motion.div>
      <p className="font-display text-lg font-bold text-ink">Cooking up something that matches your vibe…</p>
      <p className="max-w-xs text-sm text-ink-muted">Your Today&apos;s Menu will appear here in just a moment.</p>
    </div>
  );
}
