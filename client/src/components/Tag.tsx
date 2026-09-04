import type { ButtonHTMLAttributes } from "react";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  /** Persistent active/toggled-on state (e.g. a selected quick-input chip), distinct
   * from the hover styling below which only applies on pointer/keyboard focus. */
  selected?: boolean;
}

export function Tag({ label, selected = false, className = "", ...props }: TagProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-brand-accent-strong bg-brand-accent-strong text-white shadow-soft"
          : "border-tan-200 bg-cream-soft text-ink-soft hover:border-brand-accent hover:text-brand-accent-strong"
      } ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
