import { Button } from "../../components/Button";

interface NoSearchResultsProps {
  onClear: () => void;
}

/** Distinct from the true "nothing saved at all" empty state — shown when saved recipes
 * exist but the current search/mood filter matches none of them. */
export function NoSearchResults({ onClear }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">No recipes match your search.</p>
      <Button variant="secondary" size="sm" onClick={onClear}>
        Clear search
      </Button>
    </div>
  );
}
