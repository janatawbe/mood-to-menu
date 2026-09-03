import type { ReactNode } from "react";

interface NavigationItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavigationItem({ icon, label, active = false, onClick }: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex w-full items-center gap-3 rounded-2xl px-5 py-2 text-left text-base font-semibold transition-all duration-200 ${
        active
          ? "bg-brand-accent-strong text-white shadow-lift"
          : "text-ink-soft hover:bg-tan-100 hover:text-ink"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center ${
          active ? "text-white" : "text-ink-muted group-hover:text-brand-accent-strong"
        }`}
      >
        {icon}
      </span>
      <span className="font-display truncate">{label}</span>
    </button>
  );
}
