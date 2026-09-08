import type { Mood, Recipe } from "../types/domain";

export type MoodFilter = Mood | "all";

/**
 * Shared local search/filter for Favorites and Recipe History — generic over anything
 * shaped like `{ recipe: Recipe }` so the logic isn't duplicated per screen. Search
 * matches dish name, mood, or tags (case-insensitive substring); the mood filter is an
 * exact match. Purely local string matching, no fuzzy-search library.
 */
export function filterSavedRecipes<T extends { recipe: Recipe }>(
  entries: T[],
  query: string,
  mood: MoodFilter,
): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter(({ recipe }) => {
    if (mood !== "all" && recipe.detectedMood !== mood) return false;
    if (!normalizedQuery) return true;

    return (
      recipe.dishName.toLowerCase().includes(normalizedQuery) ||
      recipe.detectedMood.toLowerCase().includes(normalizedQuery) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });
}
