import type { ButtonHTMLAttributes } from "react";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Tag({ label, className = "", ...props }: TagProps) {
  return (
    <button
      type="button"
      className={`rounded-full border border-tan-200 bg-cream-soft px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-brand-accent hover:text-brand-accent-strong ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
