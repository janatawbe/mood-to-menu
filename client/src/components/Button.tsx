import type { ButtonHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-accent-strong text-white shadow-soft hover:bg-accent-800 hover:shadow-lift",
  secondary:
    "bg-cream-soft text-ink border border-tan-200 hover:bg-tan-100",
  ghost: "bg-transparent text-ink-soft hover:bg-tan-100/70",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-2.5 text-sm",
  sm: "px-3.5 py-1.5 text-xs",
};

/** Milestone 9: a small tactile press state (skipped under reduced motion) on every
 * button in the app, since they all funnel through this one component. */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
