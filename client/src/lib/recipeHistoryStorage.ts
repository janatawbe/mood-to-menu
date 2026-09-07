import { z } from "zod";
import { recipeSchema } from "../schemas/recipe";
import type { RecipeHistoryEntry } from "../types/domain";

export const RECIPE_HISTORY_STORAGE_KEY = "mood-to-menu:recipe-history:v1";

/** Recipe History isn't allowed to grow forever (Milestone 8, Step 7) — once it exceeds
 * this many entries, the oldest are dropped, newest kept. Favorites has no such cap:
 * this limit only ever applies to History. */
export const RECIPE_HISTORY_LIMIT = 50;

const historyEntrySchema = z.object({
  recipe: recipeSchema,
  generatedAt: z.string().min(1),
});

/**
 * Reads and validates the persisted Recipe History. Same untrusted-input handling as
 * favoritesStorage.ts: missing/disabled storage, invalid JSON, a non-array value, and
 * individually malformed entries are all handled without throwing, and malformed
 * entries are dropped one at a time rather than discarding the whole history. Also
 * defensively re-applies the size limit on load, in case a stored file was ever hand-
 * edited or written by a future version without the cap.
 */
export function loadRecipeHistory(): RecipeHistoryEntry[] {
  if (typeof window === "undefined") return [];

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(RECIPE_HISTORY_STORAGE_KEY);
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

  const entries: RecipeHistoryEntry[] = [];
  for (const entry of parsed) {
    const result = historyEntrySchema.safeParse(entry);
    if (result.success) entries.push(result.data);
  }
  return entries.slice(0, RECIPE_HISTORY_LIMIT);
}

/** Never throws — a full storage quota or a browser blocking storage (private mode)
 * simply means this change won't survive a refresh, not a crashed app. */
export function saveRecipeHistory(entries: RecipeHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Intentionally swallowed — see doc comment above.
  }
}
