import { useCallback, useEffect, useState } from "react";
import { loadFavorites, saveFavorites } from "../lib/favoritesStorage";
import type { FavoriteRecipe, Recipe } from "../types/domain";

/**
 * Single source of truth for Favorites — instantiated once in AppShell and shared by
 * Today's Menu and the Favorites screen, so both see the same live state. Loads once on
 * mount, saves on every change. New favorites are prepended, so `favorites` is always
 * newest-saved-first with no separate sort needed.
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
