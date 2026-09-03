import { motion, useReducedMotion } from "motion/react";
import chefImage from "../../assets/chef/chef.webp";

interface ChefCharacterProps {
  className?: string;
}

/**
 * The Mood-to-Menu chef mascot — the official illustrated asset (see
 * client/src/assets/chef/chef.webp), reused as-is at hero scale in the onboarding popup
 * and at companion scale in the sidebar so the same character appears everywhere. Only
 * the whole image breathes/drifts gently on idle — no part of it is animated separately.
 */
export function ChefCharacter({ className = "" }: ChefCharacterProps) {
  const prefersReducedMotion = useReducedMotion();

  const breathe = prefersReducedMotion
    ? undefined
    : { scale: [1, 1.014, 1], y: [0, -3, 0], rotate: [0, -0.6, 0, 0.6, 0] };
  const breatheTransition = prefersReducedMotion
    ? undefined
    : { duration: 6, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <motion.img
      src={chefImage}
      alt=""
      aria-hidden
      className={`block h-auto w-full object-contain drop-shadow-[0_14px_22px_rgba(59,42,32,0.26)] ${className}`}
      style={{ transformOrigin: "50% 100%" }}
      animate={breathe}
      transition={breatheTransition}
    />
  );
}
