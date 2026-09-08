import { useState } from "react";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import type { UseFavoritesReturn } from "../../hooks/useFavorites";
import { filterSavedRecipes, type MoodFilter } from "../../lib/savedRecipeSearch";
import { formatSavedTimestamp } from "../../lib/dateGroups";
import type { Recipe } from "../../types/domain";
import { NoSearchResults } from "../saved-recipes/NoSearchResults";
import { SavedRecipeFilters } from "../saved-recipes/SavedRecipeFilters";
import { FavoriteRecipeCard } from "./FavoriteRecipeCard";
import { FavoritesEmptyState } from "./FavoritesEmptyState";

interface FavoritesScreenProps {
  favorites: UseFavoritesReturn;
  hasRecipe: boolean;
  onOpenRecipe: (recipe: Recipe) => void;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

// Favorites screen: newest-saved-first, with local search + mood filtering.
export function FavoritesScreen({ favorites, hasRecipe, onOpenRecipe, onGoToTodaysMenu, onGoToVibeCheck }: FavoritesScreenProps) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<MoodFilter>("all");

  const visible = filterSavedRecipes(favorites.favorites, query, mood);

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <SectionHeader title="Favorites" subtitle="The recipes you love, ready whenever you are." />

      {favorites.favorites.length === 0 ? (
        <FavoritesEmptyState hasRecipe={hasRecipe} onGoToTodaysMenu={onGoToTodaysMenu} onGoToVibeCheck={onGoToVibeCheck} />
      ) : (
        <>
          {/* A softer, rounded toolbar (vs. History's plain utility row) — Favorites'
              search/filter feels integrated into the collection header rather than a
              separate control strip. */}
          <div className="mt-4 rounded-3xl border border-tan-200/50 bg-cream-soft/70 p-2.5">
            <SavedRecipeFilters query={query} onQueryChange={setQuery} mood={mood} onMoodChange={setMood} searchLabel="Search favorites" />
          </div>

          {/* pt-2 gives the first card's hover lift room to render before this element's
              own overflow-y-auto clips at its top edge; mt-2 (down from mt-4) keeps the
              total gap below the toolbar unchanged. */}
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 pt-2">
            {visible.length === 0 ? (
              <NoSearchResults
                onClear={() => {
                  setQuery("");
                  setMood("all");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2">
                {visible.map(({ recipe, savedAt }) => (
                  <FavoriteRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    timestampLabel={`Saved ${formatSavedTimestamp(savedAt)}`}
                    onOpen={() => onOpenRecipe(recipe)}
                    onRemove={() => favorites.removeFavorite(recipe.id)}
                    removeLabel={`Remove ${recipe.dishName} from Favorites`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
