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
 * Today's Menu owns the polished recipe reveal (Milestone 5) — unlike the Vibe Check
 * panel, this screen's content can legitimately be taller than the viewport (a full
 * recipe), so it scrolls internally rather than trying to shrink to fit (see the
 * `overflow-y-auto` wrapper below, and `lg:h-screen` on the app shell in AppShell.tsx
 * that gives this panel a definite height to scroll within without ever stretching or
 * distorting the sidebar).
 *
 * Milestone 8: this is also where a Favorite/History recipe gets rendered once reopened
 * (see useVibeCheck's `openRecipe`) — `vibeCheck.recipe` is the same single source of
 * truth either way, so no separate recipe-detail UI is needed.
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
