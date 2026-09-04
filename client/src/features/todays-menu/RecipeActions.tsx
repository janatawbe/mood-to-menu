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
}

/**
 * Save to Favorites and Add to Grocery List are visible, interactive action surfaces for
 * this milestone only — both are deliberately local component state (reset whenever the
 * recipe itself changes, since RecipeReveal remounts this component via `key={recipe.id}`)
 * rather than a persistence layer, which is Milestone 8 (Favorites) and Milestone 6
 * (Grocery List). Regenerate is the one action that's fully real right now.
 */
export function RecipeActions({ isRegenerating, canRegenerate, regenerateError, onRegenerate }: RecipeActionsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isFavorited, setIsFavorited] = useState(false);
  const [addedToGrocery, setAddedToGrocery] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={() => setAddedToGrocery(true)}
          disabled={addedToGrocery}
          aria-pressed={addedToGrocery}
        >
          {addedToGrocery ? <CheckIcon width={17} height={17} /> : <CartIcon width={17} height={17} />}
          {addedToGrocery ? "Added to Grocery List" : "Add ingredients to Grocery List"}
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
        {addedToGrocery && "Ingredients added to your grocery list."}
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
