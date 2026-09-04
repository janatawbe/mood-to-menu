import { moodThemes } from "../../lib/moodTheme";
import { moodPreviewEntries } from "../shell/moodPreviewData";
import type { Mood } from "../../types/domain";

/** The recipe's own `detectedMood` is always a real value (never null), so this always
 * has a theme to draw from — unlike the Vibe Check card, which may have no mood
 * selected at all. */
export function MoodBadge({ mood }: { mood: Mood }) {
  const theme = moodThemes[mood];
  const label = moodPreviewEntries.find((entry) => entry.mood === mood)?.label ?? mood;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold"
      style={{ borderColor: theme.accent, backgroundColor: theme.cardBackground, color: theme.accentStrong }}
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
      {label}
    </span>
  );
}
