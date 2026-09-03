import type { HTMLAttributes } from "react";

type CardTone = "surface" | "cream" | "accent-soft";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  interactive?: boolean;
}

const toneClasses: Record<CardTone, string> = {
  surface: "bg-surface border border-tan-200/70",
  cream: "bg-cream-soft border border-tan-200/60",
  "accent-soft": "bg-brand-accent-soft/60 border border-accent-200/50",
};

export function Card({ tone = "surface", interactive = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl p-3 shadow-soft transition-all duration-200 ${toneClasses[tone]} ${
        interactive
          ? "hover:-translate-y-0.5 hover:shadow-lift focus-visible:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    />
  );
}
