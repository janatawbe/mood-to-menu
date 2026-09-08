// Favorites localStorage persistence: load/save with per-entry validation.
import { z } from "zod";
import { recipeSchema } from "../schemas/recipe";
import type { FavoriteRecipe } from "../types/domain";

/** Versioned so a future incompatible shape change can migrate or start fresh instead of
 * silently misreading old data — same convention as GROCERY_STORAGE_KEY /
 * TASTE_MEMORY_STORAGE_KEY. */
export const FAVORITES_STORAGE_KEY = "mood-to-menu:favorites:v1";

const favoriteRecipeSchema = z.object({
  recipe: recipeSchema,
  savedAt: z.string().min(1),
});

/**
 * Reads and validates the persisted Favorites list. Treats localStorage as untrusted
 * input end to end: missing storage, disabled storage, invalid JSON, a non-array value,
 * and individually malformed entries (a corrupted/incomplete Recipe, a missing
 * `savedAt`) are all handled without throwing — malformed entries are dropped
 * individually, the same way groceryStorage/tasteMemoryStorage do, so one corrupted row
 * can't take out the rest of the user's saved favorites.
 */
export function loadFavorites(): FavoriteRecipe[] {
  if (typeof window === "undefined") return [];

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
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

  const favorites: FavoriteRecipe[] = [];
  for (const entry of parsed) {
    const result = favoriteRecipeSchema.safeParse(entry);
    if (result.success) favorites.push(result.data);
  }
  return favorites;
}

/** Never throws — a full storage quota (Recipe objects are larger than grocery items or
 * Taste Memory entries) or a browser blocking storage (private mode) simply means this
 * change won't survive a refresh, not a crashed app or corrupted in-memory state. */
export function saveFavorites(favorites: FavoriteRecipe[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Intentionally swallowed — see doc comment above.
  }
}
