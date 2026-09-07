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
          {/* A softer, rounded toolbar (vs. History's plain utility row) — Favorites'
              search/filter feels integrated into the collection header rather than a
              separate control strip. */}
          <div className="mt-4 rounded-3xl border border-tan-200/50 bg-cream-soft/70 p-2.5">
            <SavedRecipeFilters query={query} onQueryChange={setQuery} mood={mood} onMoodChange={setMood} searchLabel="Search favorites" />
          </div>

          {/* overflow-y-auto clips at THIS element's own top edge — so pt-2 here gives
              real interior room (a genuine cushion inside the scrollport, not cancelled
              by anything on a child) for the first row's hover lift to render into
              without its top border being clipped/anti-aliased away. mt-2 (instead of
              the original mt-4) on this same element keeps the total visual gap below
              the toolbar unchanged (2(mt) + 2(pt) = 4, the original mt-4), so resting
              spacing is identical to before — unlike a padding+negative-margin-on-a-
              child pairing (which cancels the child's own benefit to zero; that's NOT
              what TastePreferenceSection.tsx's px/-mx fix does — there, both classes
              sit on the one scrolling element itself, so its children still get the
              full padding as real slack while the element's own outer footprint is
              corrected via its margin instead of a child's). */}
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
