import type { MoodFilter } from "../../lib/savedRecipeSearch";
import { MoodFilterPicker } from "./MoodFilterPicker";

interface SavedRecipeFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  mood: MoodFilter;
  onMoodChange: (mood: MoodFilter) => void;
  searchLabel: string;
}

/**
 * Shared search + mood filter for Favorites and Recipe History (Milestone 8, Steps
 * 25-26). The mood control is `MoodFilterPicker` (Milestone 8 UI pass) — a custom
 * listbox styled with the app's own mood colors, rather than a generic native
 * `<select>`; the search input stays a plain text field either way.
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
      <MoodFilterPicker mood={mood} onMoodChange={onMoodChange} />
    </div>
  );
}
