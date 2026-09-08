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

/** Milestone 9: the active-item fill is its own layered `motion.span` sharing a
 * `layoutId` with every other NavigationItem in the same `layoutGroup` — Motion animates
 * it sliding from the previous active item to this one instead of an instant color
 * swap. Falls back to a plain instant swap under reduced motion (no `layoutId`, so
 * nothing slides). */
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
        // No z-index here (in particular, NOT a negative one) — the icon/label spans
        // below already paint on top of this thanks to plain DOM order (they come
        // after it in the JSX), so this just needs to be a normal stacking-context
        // layer. A negative z-index previously sent it stacking behind the sidebar
        // <nav>'s own translucent bg-surface/95 background instead, which washed the
        // solid brand-accent-strong orange down to a much fainter tint — restoring
        // the original active-state color meant fixing this, not the color itself.
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
