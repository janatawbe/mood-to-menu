import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, subtitle, align = "left" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="mb-1.5 text-xs font-bold tracking-[0.2em] text-brand-accent-strong uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-base text-ink-muted">{subtitle}</p>}
    </div>
  );
}
