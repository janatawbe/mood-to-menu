import { useCallback, useEffect, useMemo, useState } from "react";
import { loadGroceryItems, saveGroceryItems } from "../lib/groceryStorage";
import type { GroceryItem, GroceryItemSourceRecipe, RecipeIngredient } from "../types/domain";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeKey(name: string, amount: string): string {
  return `${normalize(name)}::${normalize(amount)}`;
}

/**
 * Single source of truth for the grocery list — instantiated once in AppShell and
 * shared by Today's Menu (adding ingredients) and the Grocery List screen (viewing/
 * checking/removing them), so both always see the same live state (Milestone 6, Step
 * 23). Persistence is centralized here: loads once on mount, saves on every change.
 *
 * Independent of the current recipe on purpose (Step 25) — nothing here is cleared by
 * regenerating or navigating away from Today's Menu.
 */
export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>(() => loadGroceryItems());

  useEffect(() => {
    saveGroceryItems(items);
  }, [items]);

  /**
   * Adds any ingredients not already present *from that same source recipe* (exact
   * name+amount match, case/whitespace-insensitive) — repeated "Add all" clicks, or an
   * individual add followed by "Add all", never produce duplicate rows, and existing
   * items (including their checked state) are left completely untouched. Ingredients
   * from a *different* recipe are always kept as separate entries, even if the name and
   * amount happen to match — see Step 15's "2 tomatoes vs 3 tomatoes" case: merging
   * those would require unsafe unit arithmetic this app doesn't attempt.
   *
   * Returns how many new items were actually added, so callers can give accurate
   * feedback ("Added" vs "already on your list").
   */
  const addIngredients = useCallback(
    (ingredients: RecipeIngredient[], sourceRecipe: GroceryItemSourceRecipe): number => {
      const existingKeys = new Set(
        items
          .filter((item) => item.sourceRecipe.id === sourceRecipe.id)
          .map((item) => dedupeKey(item.name, item.amount)),
      );

      const addedAt = new Date().toISOString();
      const additions: GroceryItem[] = [];
      for (const ingredient of ingredients) {
        const key = dedupeKey(ingredient.name, ingredient.amount);
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        additions.push({
          id: crypto.randomUUID(),
          name: ingredient.name,
          amount: ingredient.amount,
          checked: false,
          sourceRecipe,
          addedAt,
        });
      }

      if (additions.length > 0) {
        setItems((current) => [...current, ...additions]);
      }
      return additions.length;
    },
    [items],
  );

  /** Adds exactly one ingredient; returns whether it was actually added (false if that
   * exact ingredient from that recipe was already on the list). */
  const addIngredient = useCallback(
    (ingredient: RecipeIngredient, sourceRecipe: GroceryItemSourceRecipe): boolean =>
      addIngredients([ingredient], sourceRecipe) > 0,
    [addIngredients],
  );

  /** Whether this exact ingredient (from this exact recipe) is already on the list —
   * reads live `items` state, so removing it from the Grocery List screen is reflected
   * back on Today's Menu immediately (Step 22), no separate/stale copy of the data. */
  const isIngredientAdded = useCallback(
    (ingredient: RecipeIngredient, sourceRecipeId: string): boolean => {
      const key = dedupeKey(ingredient.name, ingredient.amount);
      return items.some((item) => item.sourceRecipe.id === sourceRecipeId && dedupeKey(item.name, item.amount) === key);
    },
    [items],
  );

  const toggleChecked = useCallback((id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((current) => current.filter((item) => !item.checked));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const summary = useMemo(() => {
    const total = items.length;
    const checked = items.filter((item) => item.checked).length;
    return { total, checked, remaining: total - checked };
  }, [items]);

  return {
    items,
    summary,
    addIngredients,
    addIngredient,
    isIngredientAdded,
    toggleChecked,
    removeItem,
    clearCompleted,
    clearAll,
  };
}

export type UseGroceryListReturn = ReturnType<typeof useGroceryList>;
