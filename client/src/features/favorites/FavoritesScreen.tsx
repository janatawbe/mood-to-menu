import { useState } from "react";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import type { UseFavoritesReturn } from "../../hooks/useFavorites";
import { filterSavedRecipes, type MoodFilter } from "../../lib/savedRecipeSearch";
import { formatSavedTimestamp } from "../../lib/dateGroups";
import type { Recipe } from "../../types/domain";
import { NoSearchResults } from "../saved-recipes/NoSearchResults";
import { SavedRecipeCard } from "../saved-recipes/SavedRecipeCard";
import { SavedRecipeFilters } from "../saved-recipes/SavedRecipeFilters";
import { FavoritesEmptyState } from "./FavoritesEmptyState";

interface FavoritesScreenProps {
  favorites: UseFavoritesReturn;
  hasRecipe: boolean;
  onOpenRecipe: (recipe: Recipe) => void;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/**
 * The real, persistent Favorites screen (Milestone 8) — replaces the "coming soon"
 * placeholder. Ordered newest-saved-first (useFavorites' own contract), with local
 * search + mood filtering; no ingredients/instructions here, cards stay scannable.
 */
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
          <div className="mt-3">
            <SavedRecipeFilters query={query} onQueryChange={setQuery} mood={mood} onMoodChange={setMood} searchLabel="Search favorites" />
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {visible.length === 0 ? (
              <NoSearchResults
                onClear={() => {
                  setQuery("");
                  setMood("all");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                {visible.map(({ recipe, savedAt }) => (
                  <SavedRecipeCard
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
