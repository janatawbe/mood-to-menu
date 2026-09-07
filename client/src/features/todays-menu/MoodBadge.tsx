import { moodThemes } from "../../lib/moodTheme";
import { moodPreviewEntries } from "../shell/moodPreviewData";
import type { Mood } from "../../types/domain";

const sizeClasses = {
  md: "gap-1.5 px-3.5 py-1.5 text-sm",
  sm: "gap-1 px-2 py-0.5 text-xs",
};

/** The recipe's own `detectedMood` is always a real value (never null), so this always
 * has a theme to draw from — unlike the Vibe Check card, which may have no mood
 * selected at all. `size="sm"` (Milestone 8) is a smaller variant for compact contexts
 * like Recipe History's rows — the default stays exactly as before everywhere else. */
export function MoodBadge({ mood, size = "md" }: { mood: Mood; size?: "sm" | "md" }) {
  const theme = moodThemes[mood];
  const label = moodPreviewEntries.find((entry) => entry.mood === mood)?.label ?? mood;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClasses[size]}`}
      style={{ borderColor: theme.accent, backgroundColor: theme.cardBackground, color: theme.accentStrong }}
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
      {label}
    </span>
  );
}
