import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface NavigationItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  /** Namespaces the shared `layoutId` below so two simultaneously-mounted nav lists
   * (the desktop sidebar and the mobile overlay both exist in the DOM while the mobile
   * nav is open) never fight over the same animated pill. */
  layoutGroup?: string;
}

/** Sidebar nav button. The active-item fill is a layered `motion.span` sharing a
 * `layoutId` with every other item in the same `layoutGroup`, so Motion slides it
 * between items instead of an instant color swap (falls back to an instant swap under
 * reduced motion). */
export function NavigationItem({ icon, label, active = false, onClick, layoutGroup = "default" }: NavigationItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-5 py-2 text-left text-base font-semibold transition-colors duration-200 ${
        active ? "text-white" : "text-ink-soft hover:bg-tan-100 hover:text-ink"
      }`}
    >
      {active && (
        // No z-index here — DOM order alone puts the icon/label spans on top. A
        // negative z-index previously sank this behind the sidebar's own translucent
        // background, washing out the brand-accent orange.
        <motion.span
          layoutId={prefersReducedMotion ? undefined : `active-nav-pill-${layoutGroup}`}
          className="absolute inset-0 rounded-2xl bg-brand-accent-strong shadow-lift"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span
        className={`relative flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5 ${
          active ? "text-white" : "text-ink-muted group-hover:text-brand-accent-strong"
        }`}
      >
        {icon}
      </span>
      <span className="font-display relative truncate">{label}</span>
    </button>
  );
}
