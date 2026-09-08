import { motion, useReducedMotion } from "motion/react";
import { Button } from "../../components/Button";
import { CartIcon, CheckIcon, HeartIcon, RefreshIcon } from "../../components/icons";
import type { VibeCheckError } from "../../hooks/useVibeCheck";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";

interface RecipeActionsProps {
  isRegenerating: boolean;
  canRegenerate: boolean;
  /** True while viewing a reopened Favorite/History recipe — Regenerate is disabled and
   * explains why via its title, rather than silently regenerating against unrelated
   * current Vibe Check state (Milestone 8, Step 19). */
  isReopenedRecipe: boolean;
  regenerateError: VibeCheckError | null;
  onRegenerate: () => void;
  /** True once every ingredient in the current recipe is already on the Grocery List —
   * recomputed live from shared grocery state, so removing one on the Grocery List
   * screen flips this back to false here too (Milestone 6, Step 22). */
  allIngredientsAdded: boolean;
  onAddAllIngredients: () => void;
  /** Real, persistent Favorites state (Milestone 8) — recomputed live from shared
   * favorites state by recipe id, so unfavoriting from the Favorites screen flips this
   * back to false here too, the same way Grocery List's `allIngredientsAdded` does. */
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

/**
 * Add to Grocery List, Save to Favorites, and Regenerate are all fully real: Grocery
 * List is backed by the shared `useGroceryList` state (Milestone 6), Favorites by the
 * shared `useFavorites` state (Milestone 8), Regenerate by the real Gemini request.
 */
export function RecipeActions({
  isRegenerating,
  canRegenerate,
  isReopenedRecipe,
  regenerateError,
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
        <Button
          variant="secondary"
          onClick={onRegenerate}
          disabled={!canRegenerate || isRegenerating}
          title={isReopenedRecipe ? "Regenerate isn't available for a saved recipe you're viewing." : undefined}
        >
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
