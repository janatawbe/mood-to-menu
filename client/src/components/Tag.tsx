import { useState, type ButtonHTMLAttributes, type CSSProperties, type FocusEvent, type MouseEvent } from "react";
import { getMoodTheme, hexToRgba } from "../lib/moodTheme";
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

export function Tag({
  label,
  selected = false,
  mood = null,
  className = "",
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: TagProps) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = getMoodTheme(mood);
  const showMoodHover = isHovered && !selected && theme;

  function handleMouseEnter(event: MouseEvent<HTMLButtonElement>) {
    setIsHovered(true);
    onMouseEnter?.(event);
  }
  function handleMouseLeave(event: MouseEvent<HTMLButtonElement>) {
    setIsHovered(false);
    onMouseLeave?.(event);
  }
  function handleFocus(event: FocusEvent<HTMLButtonElement>) {
    setIsHovered(true);
    onFocus?.(event);
  }
  function handleBlur(event: FocusEvent<HTMLButtonElement>) {
    setIsHovered(false);
    onBlur?.(event);
  }

  const style: CSSProperties = selected
    ? theme
      ? { backgroundColor: theme.accentStrong, borderColor: theme.accentStrong }
      : {}
    : showMoodHover
      ? { borderColor: theme.accent, backgroundColor: hexToRgba(theme.accent, 0.18), color: theme.accentStrong }
      : {};

  return (
    <button
      type="button"
      aria-pressed={selected}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
        selected
          ? theme
            ? "text-white"
            : "border-brand-accent-strong bg-brand-accent-strong text-white"
          : theme
            ? "border-tan-200 bg-cream-soft text-ink-soft"
            : "border-tan-200 bg-cream-soft text-ink-soft hover:border-brand-accent hover:text-brand-accent-strong"
      } ${className}`}
      style={style}
      {...props}
    >
      {label}
    </button>
  );
}
