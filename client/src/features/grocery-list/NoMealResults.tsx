import { Button } from "../../components/Button";

interface NoMealResultsProps {
  onShowAllMeals: () => void;
}

/** Distinct from GroceryListEmptyState — shown when the list has items but the selected
 * meal filter matches none of them (usually just an instant before it auto-resets to
 * "All meals"). */
export function NoMealResults({ onShowAllMeals }: NoMealResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-ink">No items for this meal.</p>
      <Button variant="secondary" size="sm" onClick={onShowAllMeals}>
        Show all meals
      </Button>
    </div>
  );
}
