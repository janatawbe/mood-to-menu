// Shared translucent surface panel used as each screen's outer container.
import type { HTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-4xl border border-tan-200/60 bg-surface/90 p-4 shadow-soft backdrop-blur-sm sm:p-5 ${className}`}
      {...props}
    />
  );
}
