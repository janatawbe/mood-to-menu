import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  icon: ReactNode;
  label: string;
}

/** Shared icon-only button (remove/close/add controls) with a tactile press state,
 * skipped under reduced motion. */
export function IconButton({ icon, label, className = "", ...props }: IconButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      aria-label={label}
      title={label}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-ink-soft transition-colors duration-200 hover:bg-tan-100 hover:text-ink ${className}`}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
