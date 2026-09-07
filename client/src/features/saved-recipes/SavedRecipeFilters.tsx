import { moodPreviewEntries } from "../shell/moodPreviewData";
import type { MoodFilter } from "../../lib/savedRecipeSearch";

interface SavedRecipeFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  mood: MoodFilter;
  onMoodChange: (mood: MoodFilter) => void;
  searchLabel: string;
}

/**
 * Shared search + mood filter for Favorites and Recipe History (Milestone 8, Steps
 * 25-26) — a text input plus a native `<select>` for the mood, deliberately: a native
 * select is fully keyboard-usable for free, and a 7-option single-choice filter doesn't
 * need a custom dropdown built from scratch.
 */
export function SavedRecipeFilters({ query, onQueryChange, mood, onMoodChange, searchLabel }: SavedRecipeFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by dish name…"
        aria-label={searchLabel}
        className="mood-focus-ring min-w-0 flex-1 rounded-2xl border border-tan-200 bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted"
      />
      <select
        value={mood}
        onChange={(event) => onMoodChange(event.target.value as MoodFilter)}
        aria-label="Filter by mood"
        className="mood-focus-ring shrink-0 rounded-2xl border border-tan-200 bg-surface px-3 py-2 text-sm text-ink-soft"
      >
        <option value="all">All moods</option>
        {moodPreviewEntries.map((entry) => (
          <option key={entry.mood} value={entry.mood}>
            {entry.label}
          </option>
        ))}
      </select>
    </div>
  );
}
