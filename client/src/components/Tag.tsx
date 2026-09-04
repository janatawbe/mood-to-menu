import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { getMoodTheme } from "../lib/moodTheme";
import type { Mood } from "../types/domain";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  /** Persistent active/toggled-on state (e.g. a selected quick-input chip), distinct
   * from the hover styling below which only applies on pointer/keyboard focus. */
  selected?: boolean;
  /** The active Vibe Check mood, if any — when set, both the selected fill and the
   * unselected hover state pick up that mood's own color via the central theme
   * (see ../lib/moodTheme) instead of the default brand orange. */
  mood?: Mood | null;
}

export function Tag({ label, selected = false, mood = null, className = "", ...props }: TagProps) {
  const theme = getMoodTheme(mood);

  const style: CSSProperties = selected
    ? theme
      ? { backgroundColor: theme.accentStrong, borderColor: theme.accentStrong }
      : {}
    : theme
      ? ({
          "--mood-hover-accent": theme.accent,
          "--mood-hover-accent-strong": theme.accentStrong,
        } as CSSProperties)
      : {};

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        selected
          ? theme
            ? "text-white"
            : "border-brand-accent-strong bg-brand-accent-strong text-white"
          : "mood-hover-border mood-hover-text border-tan-200 bg-cream-soft text-ink-soft"
      } ${className}`}
      style={style}
      {...props}
    >
      {label}
    </button>
  );
}
