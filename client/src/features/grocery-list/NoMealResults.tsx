import { Button } from "../../components/Button";

interface NoMealResultsProps {
  onShowAllMeals: () => void;
}

/** Distinct from GroceryListEmptyState (Milestone 9, Step "SEARCH + FILTER EMPTY
 * STATE") — shown only when the Grocery List has items but the selected meal filter
 * currently matches none of them (normally just a brief instant before the filter
 * auto-resets to "All meals" once that meal's last item disappears; kept as a real state
 * too, in case a caller ever lands here another way). */
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
