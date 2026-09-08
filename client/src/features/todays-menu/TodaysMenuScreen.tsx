import { Panel } from "../../components/Panel";
import type { UseFavoritesReturn } from "../../hooks/useFavorites";
import type { UseGroceryListReturn } from "../../hooks/useGroceryList";
import type { UseVibeCheckReturn } from "../../hooks/useVibeCheck";
import { CookingState } from "./CookingState";
import { RecipeReveal } from "./RecipeReveal";
import { TodaysMenuEmptyState } from "./TodaysMenuEmptyState";

interface TodaysMenuScreenProps {
  vibeCheck: UseVibeCheckReturn;
  groceryList: UseGroceryListReturn;
  favorites: UseFavoritesReturn;
  onGoToVibeCheck: () => void;
}

/**
 * Today's Menu: the recipe reveal, cooking state, or empty state. Content can be taller
 * than the viewport, so it scrolls internally (`overflow-y-auto`, paired with
 * `lg:h-screen` on AppShell) rather than shrinking to fit. Also renders a reopened
 * Favorite/History recipe — `vibeCheck.recipe` is the same source of truth either way,
 * so no separate recipe-detail UI is needed.
 */
export function TodaysMenuScreen({ vibeCheck, groceryList, favorites, onGoToVibeCheck }: TodaysMenuScreenProps) {
  const { recipe, phase, isRegenerating, regenerateError, canRegenerate, isReopenedRecipe, regenerate } = vibeCheck;

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {recipe ? (
          <RecipeReveal
            recipe={recipe}
            isRegenerating={isRegenerating}
            regenerateError={regenerateError}
            canRegenerate={canRegenerate}
            isReopenedRecipe={isReopenedRecipe}
            onRegenerate={() => void regenerate()}
            groceryList={groceryList}
            favorites={favorites}
          />
        ) : phase === "loading" ? (
          <CookingState />
        ) : (
          <TodaysMenuEmptyState onStartVibeCheck={onGoToVibeCheck} />
        )}
      </div>
    </Panel>
  );
}
