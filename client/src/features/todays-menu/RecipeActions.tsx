import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { Button } from "../../components/Button";
import { CartIcon, CheckIcon, HeartIcon, RefreshIcon } from "../../components/icons";
import type { VibeCheckError } from "../../hooks/useVibeCheck";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";

interface RecipeActionsProps {
  isRegenerating: boolean;
  canRegenerate: boolean;
  regenerateError: VibeCheckError | null;
  onRegenerate: () => void;
  /** True once every ingredient in the current recipe is already on the Grocery List —
   * recomputed live from shared grocery state, so removing one on the Grocery List
   * screen flips this back to false here too (Milestone 6, Step 22). */
  allIngredientsAdded: boolean;
  onAddAllIngredients: () => void;
}

/**
 * Save to Favorites stays a visible, session-local placeholder for Milestone 8. Add to
 * Grocery List and Regenerate are both fully real: Grocery List is backed by the shared
 * `useGroceryList` state (Milestone 6), Regenerate by the real Gemini request.
 */
export function RecipeActions({
  isRegenerating,
  canRegenerate,
  regenerateError,
  onRegenerate,
  allIngredientsAdded,
  onAddAllIngredients,
}: RecipeActionsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={onAddAllIngredients} aria-pressed={allIngredientsAdded}>
          {allIngredientsAdded ? <CheckIcon width={17} height={17} /> : <CartIcon width={17} height={17} />}
          {allIngredientsAdded ? "Added to Grocery List" : "Add ingredients to Grocery List"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsFavorited((current) => !current)}
          aria-pressed={isFavorited}
        >
          <HeartIcon
            width={17}
            height={17}
            fill={isFavorited ? "currentColor" : "none"}
            className={isFavorited ? "text-brand-accent-strong" : ""}
          />
          {isFavorited ? "Saved to Favorites" : "Save to Favorites"}
        </Button>
        <Button variant="secondary" onClick={onRegenerate} disabled={!canRegenerate || isRegenerating}>
          <RefreshIcon width={16} height={16} className={isRegenerating && !prefersReducedMotion ? "animate-spin" : ""} />
          {isRegenerating ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>

      <span className="sr-only" aria-live="polite">
        {allIngredientsAdded && "All ingredients are on your grocery list."}
        {isFavorited && " Recipe saved to favorites."}
      </span>

      {regenerateError && (
        <div
          role="alert"
          className="rounded-2xl border border-tan-200 bg-cream-soft px-3.5 py-2.5 text-sm text-ink-soft"
        >
          {getFriendlyErrorMessage(regenerateError.code)}
        </div>
      )}
    </div>
  );
}
