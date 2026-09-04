import { motion, useReducedMotion } from "motion/react";

interface GrocerySummaryProps {
  total: number;
  checked: number;
}

/** A lightweight progress line, not a dashboard — "12 items · 4 checked · 8 left" plus
 * a subtle bar. Handles zero items safely (no division, bar simply doesn't render). */
export function GrocerySummary({ total, checked }: GrocerySummaryProps) {
  const prefersReducedMotion = useReducedMotion();
  const remaining = total - checked;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-ink-soft" aria-live="polite">
        {total} {total === 1 ? "item" : "items"} · {checked} checked · {remaining} left
      </p>
      {total > 0 && (
        <div
          role="progressbar"
          aria-label="Grocery list progress"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-tan-100"
        >
          <motion.div
            className="h-full rounded-full bg-brand-accent-strong"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
