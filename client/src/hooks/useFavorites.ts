import { useCallback, useEffect, useState } from "react";
import { loadFavorites, saveFavorites } from "../lib/favoritesStorage";
import type { FavoriteRecipe, Recipe } from "../types/domain";

/**
 * Single source of truth for Favorites (Milestone 8) — instantiated once in AppShell and
 * shared by Today's Menu (favorite/unfavorite the current recipe) and the Favorites
 * screen (viewing/removing), so both always see the same live state. Persistence is
 * centralized here: loads once on mount, saves on every change.
 *
 * New favorites are prepended, so `favorites` is always newest-saved-first (Step 28) —
 * no separate sort needed at read time.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>(() => loadFavorites());

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorited = useCallback(
    (recipeId: string): boolean => favorites.some((entry) => entry.recipe.id === recipeId),
    [favorites],
  );

  /** No-ops (does not duplicate) if this recipe id is already saved. */
  const addFavorite = useCallback((recipe: Recipe) => {
    setFavorites((current) => {
      if (current.some((entry) => entry.recipe.id === recipe.id)) return current;
      return [{ recipe, savedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  const removeFavorite = useCallback((recipeId: string) => {
    setFavorites((current) => current.filter((entry) => entry.recipe.id !== recipeId));
  }, []);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites((current) => {
      const exists = current.some((entry) => entry.recipe.id === recipe.id);
      if (exists) return current.filter((entry) => entry.recipe.id !== recipe.id);
      return [{ recipe, savedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  return { favorites, isFavorited, addFavorite, removeFavorite, toggleFavorite };
}

export type UseFavoritesReturn = ReturnType<typeof useFavorites>;
