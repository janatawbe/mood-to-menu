// Derives the "Filter by meal" option list and applies it to Grocery List items.
import type { GroceryItem, GroceryItemSourceRecipe } from "../types/domain";

/** The one non-recipe-id value the meal filter can hold — "show everything." */
export const ALL_MEALS = "all";

export type MealFilter = string;

/**
 * The distinct source recipes currently represented in the Grocery List, in first-seen
 * order. Recipe id is the real identity (a dish name is never assumed unique); a recipe
 * contributing multiple items still appears exactly once. Derived fresh from `items`
 * every time, so it's always in sync with what's on the list.
 */
export function deriveMealOptions(items: GroceryItem[]): GroceryItemSourceRecipe[] {
  const seen = new Map<string, GroceryItemSourceRecipe>();
  for (const item of items) {
    if (!seen.has(item.sourceRecipe.id)) seen.set(item.sourceRecipe.id, item.sourceRecipe);
  }
  return [...seen.values()];
}

/**
 * Purely a DISPLAY filter — returns the subset of `items` belonging to the selected
 * recipe id, or all of `items` unchanged for `ALL_MEALS`. Never mutates or reorders
 * `items`, and callers must keep using the full, unfiltered `items` (and its derived
 * `summary`) for every actual data operation (Clear Completed/Clear All/checked counts) —
 * only what's rendered should change here.
 */
export function filterGroceryItemsByMeal(items: GroceryItem[], mealFilter: MealFilter): GroceryItem[] {
  if (mealFilter === ALL_MEALS) return items;
  return items.filter((item) => item.sourceRecipe.id === mealFilter);
}
