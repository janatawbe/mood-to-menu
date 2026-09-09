import { motion, useReducedMotion } from "motion/react";
import { Button } from "../../components/Button";
import { CartIcon, CheckIcon, HeartIcon, RefreshIcon } from "../../components/icons";
import type { VibeCheckError } from "../../hooks/useVibeCheck";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";

// The Today's Menu action row: add ingredients, favorite, and (when supported)
// regenerate. Regenerate is entirely optional — omitting `onRegenerate` hides that
// button and its related error box, so this same row can be reused for a public
// "Recently Generated" recipe, which can never be regenerated (no Vibe Check/Gemini
// context to regenerate from).
interface RecipeActionsProps {
  isRegenerating?: boolean;
  canRegenerate?: boolean;
  /** True while viewing a reopened Favorite/History recipe — Regenerate is disabled and
   * explains why via its title, rather than silently regenerating against unrelated
   * current Vibe Check state. */
  isReopenedRecipe?: boolean;
  regenerateError?: VibeCheckError | null;
  onRegenerate?: () => void;
  /** True once every ingredient is already on the Grocery List — recomputed live from
   * shared grocery state, so a removal on that screen flips this back to false here. */
  allIngredientsAdded: boolean;
  onAddAllIngredients: () => void;
  /** Recomputed live from shared Favorites state by recipe id, so unfavoriting from the
   * Favorites screen flips this back to false here too. */
  isFavorited: boolean;
  onToggleFavorite: () => void;
}
export function RecipeActions({
  isRegenerating = false,
  canRegenerate = false,
  isReopenedRecipe = false,
  regenerateError = null,
  onRegenerate,
  allIngredientsAdded,
  onAddAllIngredients,
  isFavorited,
  onToggleFavorite,
}: RecipeActionsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={onAddAllIngredients} aria-pressed={allIngredientsAdded}>
          {allIngredientsAdded ? <CheckIcon width={17} height={17} /> : <CartIcon width={17} height={17} />}
          {allIngredientsAdded ? "Added to Grocery List" : "Add ingredients to Grocery List"}
        </Button>
        <Button variant="secondary" onClick={onToggleFavorite} aria-pressed={isFavorited}>
          <motion.span
            className="inline-flex"
            animate={{ scale: isFavorited ? 1.15 : 1 }}
            transition={prefersReducedMotion ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 15 }}
          >
            <HeartIcon
              width={17}
              height={17}
              fill={isFavorited ? "currentColor" : "none"}
              className={isFavorited ? "text-brand-accent-strong" : ""}
            />
          </motion.span>
          {isFavorited ? "Saved to Favorites" : "Save to Favorites"}
        </Button>
        {onRegenerate && (
          <Button
            variant="secondary"
            onClick={onRegenerate}
            disabled={!canRegenerate || isRegenerating}
            title={isReopenedRecipe ? "Regenerate isn't available for a saved recipe you're viewing." : undefined}
          >
            <RefreshIcon width={16} height={16} className={isRegenerating && !prefersReducedMotion ? "animate-spin" : ""} />
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        )}
      </div>

      <span className="sr-only" aria-live="polite">
        {allIngredientsAdded && "All ingredients are on your grocery list."}
        {isFavorited && " Recipe saved to favorites."}
      </span>

      {onRegenerate && regenerateError && (
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
