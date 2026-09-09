import { useCallback, useEffect, useState } from "react";
import { loadPublicFavorites, savePublicFavorites } from "../lib/publicFavoritesStorage";
import type { PublicFavoriteRecipe, PublicRecipe } from "../types/domain";

/**
 * Favorites for public "Recently Generated" recipes — instantiated once in AppShell,
 * independent of `useFavorites` (which owns full-`Recipe` Favorites; see
 * `PublicFavoriteRecipe` in types/domain.ts for why these are separate stores). Loads
 * once on mount, saves on every change, newest-saved-first.
 */
export function usePublicFavorites() {
  const [favorites, setFavorites] = useState<PublicFavoriteRecipe[]>(() => loadPublicFavorites());

  useEffect(() => {
    savePublicFavorites(favorites);
  }, [favorites]);

  const isFavorited = useCallback(
    (recipeId: string): boolean => favorites.some((entry) => entry.recipe.id === recipeId),
    [favorites],
  );

  const toggleFavorite = useCallback((recipe: PublicRecipe) => {
    setFavorites((current) => {
      const exists = current.some((entry) => entry.recipe.id === recipe.id);
      if (exists) return current.filter((entry) => entry.recipe.id !== recipe.id);
      return [{ recipe, savedAt: new Date().toISOString() }, ...current];
    });
  }, []);

  return { favorites, isFavorited, toggleFavorite };
}

export type UsePublicFavoritesReturn = ReturnType<typeof usePublicFavorites>;
