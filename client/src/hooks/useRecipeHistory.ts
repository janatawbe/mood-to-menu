import { useCallback, useEffect, useState } from "react";
import { loadRecipeHistory, RECIPE_HISTORY_LIMIT, saveRecipeHistory } from "../lib/recipeHistoryStorage";
import type { Recipe, RecipeHistoryEntry } from "../types/domain";

/**
 * Single source of truth for Recipe History — instantiated once in AppShell.
 * `recordGeneration` is called imperatively, once per successful Gemini response (see
 * useVibeCheck's `onRecipeGenerated`), never from an effect — that would risk a
 * duplicate row under React StrictMode's double-invoke. Entries are prepended, so
 * `history` is always newest-first.
 */
export function useRecipeHistory() {
  const [history, setHistory] = useState<RecipeHistoryEntry[]>(() => loadRecipeHistory());

  useEffect(() => {
    saveRecipeHistory(history);
  }, [history]);

  /** Records one successful generation. Also guards against ever producing two rows for
   * the same recipe id (belt-and-suspenders on top of "call this exactly once per
   * response" at the call site) — a no-op if that id is already the most recent entry
   * or already present anywhere in history. */
  const recordGeneration = useCallback((recipe: Recipe) => {
    setHistory((current) => {
      if (current.some((entry) => entry.recipe.id === recipe.id)) return current;
      const next = [{ recipe, generatedAt: new Date().toISOString() }, ...current];
      return next.length > RECIPE_HISTORY_LIMIT ? next.slice(0, RECIPE_HISTORY_LIMIT) : next;
    });
  }, []);

  const removeEntry = useCallback((recipeId: string) => {
    setHistory((current) => current.filter((entry) => entry.recipe.id !== recipeId));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, recordGeneration, removeEntry, clearHistory };
}

export type UseRecipeHistoryReturn = ReturnType<typeof useRecipeHistory>;
