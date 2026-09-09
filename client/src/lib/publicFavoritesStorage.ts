// Public-recipe Favorites localStorage persistence — a separate store from
// favoritesStorage.ts (which wraps a full `Recipe` and requires `reasoning`). See
// `PublicFavoriteRecipe` in types/domain.ts for why this is independent rather than a
// union on the existing Favorites store.
import { z } from "zod";
import { publicRecipeSchema } from "../schemas/publicRecipe";
import type { PublicFavoriteRecipe } from "../types/domain";

export const PUBLIC_FAVORITES_STORAGE_KEY = "mood-to-menu:favorites-public:v1";

// `publicRecipeSchema` is `.strict()`, so a stored entry carrying an unexpected field
// (e.g. a `reasoning` that should never exist on a PublicRecipe) is rejected here too,
// not just on the original fetch from the server.
const publicFavoriteRecipeSchema = z.object({
  recipe: publicRecipeSchema,
  savedAt: z.string().min(1),
});

/**
 * Reads and validates persisted public-recipe Favorites. Same robustness as
 * `loadFavorites`: missing storage, disabled storage, invalid JSON, a non-array value,
 * and individually malformed entries are all handled without throwing — malformed
 * entries are dropped individually rather than invalidating the whole list.
 */
export function loadPublicFavorites(): PublicFavoriteRecipe[] {
  if (typeof window === "undefined") return [];

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PUBLIC_FAVORITES_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const favorites: PublicFavoriteRecipe[] = [];
  for (const entry of parsed) {
    const result = publicFavoriteRecipeSchema.safeParse(entry);
    if (result.success) favorites.push(result.data);
  }
  return favorites;
}

/** Never throws — a full storage quota or a browser blocking storage (private mode)
 * simply means this change won't survive a refresh, not a crashed app. */
export function savePublicFavorites(favorites: PublicFavoriteRecipe[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PUBLIC_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Intentionally swallowed — see doc comment above.
  }
}
