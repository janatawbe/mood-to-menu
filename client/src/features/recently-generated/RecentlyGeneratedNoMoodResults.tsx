import { Button } from "../../components/Button";

interface RecentlyGeneratedNoMoodResultsProps {
  onClear: () => void;
}

/** Distinct from `RecentlyGeneratedEmptyState` (no public recipes exist at all) — shown
 * when public recipes exist but the selected mood filter matches none of them. Mirrors
 * Favorites/Recipe History's `NoSearchResults` styling, with copy for a mood-only filter
 * (no search box on this screen). */
export function RecentlyGeneratedNoMoodResults({ onClear }: RecentlyGeneratedNoMoodResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">No recipes match that mood yet.</p>
      <Button variant="secondary" size="sm" onClick={onClear}>
        Show all moods
      </Button>
    </div>
  );
}
