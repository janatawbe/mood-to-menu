import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { GROCERY_STORAGE_KEY } from "../lib/groceryStorage";
import type { RecipeIngredient } from "../types/domain";
import { useGroceryList } from "./useGroceryList";

const RECIPE_A = { id: "recipe-a", dishName: "Creamy Chicken Rice Bowl" };
const RECIPE_B = { id: "recipe-b", dishName: "Tomato Basil Soup" };

const PASTA_INGREDIENTS: RecipeIngredient[] = [
  { name: "Spaghetti", amount: "200 g" },
  { name: "Garlic", amount: "2 cloves" },
  { name: "Butter", amount: "3 tbsp" },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("useGroceryList", () => {
  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => useGroceryList());
    expect(result.current.items).toEqual([]);
    expect(result.current.summary).toEqual({ total: 0, checked: 0, remaining: 0 });
  });

  it("Add All adds every ingredient from the recipe, attaching the source recipe", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items.every((item) => item.sourceRecipe.id === RECIPE_A.id)).toBe(true);
    expect(result.current.items.map((item) => item.name)).toEqual(["Spaghetti", "Garlic", "Butter"]);
  });

  it("repeated Add All for the same recipe does not duplicate items", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });

    expect(result.current.items).toHaveLength(3);
  });

  it("individual Add adds exactly one ingredient", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredient(PASTA_INGREDIENTS[0]!, RECIPE_A);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]!.name).toBe("Spaghetti");
  });

  it("an individually added item is not duplicated by a later Add All", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredient(PASTA_INGREDIENTS[0]!, RECIPE_A);
    });
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });

    expect(result.current.items).toHaveLength(3);
  });

  it("preserves checked state on existing items when Add All is pressed again", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    const firstId = result.current.items[0]!.id;
    act(() => {
      result.current.toggleChecked(firstId);
    });
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });

    expect(result.current.items.find((item) => item.id === firstId)?.checked).toBe(true);
  });

  it("adds only the missing ingredients when some are already present", () => {
    const { result } = renderHook(() => useGroceryList());

    act(() => {
      result.current.addIngredient(PASTA_INGREDIENTS[0]!, RECIPE_A);
    });
    act(() => {
      const added = result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
      expect(added).toBe(2);
    });

    expect(result.current.items).toHaveLength(3);
  });

  it("keeps ingredients from different recipes as separate entries, even with the same name/amount", () => {
    const { result } = renderHook(() => useGroceryList());
    const tomatoes: RecipeIngredient = { name: "Tomatoes", amount: "2" };

    act(() => {
      result.current.addIngredient(tomatoes, RECIPE_A);
    });
    act(() => {
      result.current.addIngredient(tomatoes, RECIPE_B);
    });

    expect(result.current.items).toHaveLength(2);
    expect(new Set(result.current.items.map((item) => item.sourceRecipe.id))).toEqual(
      new Set([RECIPE_A.id, RECIPE_B.id]),
    );
  });

  it("isIngredientAdded reflects live state, including after removal", () => {
    const { result } = renderHook(() => useGroceryList());
    const garlic = PASTA_INGREDIENTS[1]!;

    act(() => {
      result.current.addIngredient(garlic, RECIPE_A);
    });
    expect(result.current.isIngredientAdded(garlic, RECIPE_A.id)).toBe(true);

    const id = result.current.items[0]!.id;
    act(() => {
      result.current.removeItem(id);
    });
    expect(result.current.isIngredientAdded(garlic, RECIPE_A.id)).toBe(false);
  });

  it("toggleChecked flips an item's checked state and updates the summary", () => {
    const { result } = renderHook(() => useGroceryList());
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    const id = result.current.items[0]!.id;

    act(() => result.current.toggleChecked(id));
    expect(result.current.items.find((item) => item.id === id)?.checked).toBe(true);
    expect(result.current.summary).toEqual({ total: 3, checked: 1, remaining: 2 });

    act(() => result.current.toggleChecked(id));
    expect(result.current.items.find((item) => item.id === id)?.checked).toBe(false);
    expect(result.current.summary.checked).toBe(0);
  });

  it("removeItem removes exactly that item", () => {
    const { result } = renderHook(() => useGroceryList());
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    const id = result.current.items[1]!.id;

    act(() => result.current.removeItem(id));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.find((item) => item.id === id)).toBeUndefined();
  });

  it("clearCompleted removes only checked items and leaves unchecked ones untouched", () => {
    const { result } = renderHook(() => useGroceryList());
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    act(() => result.current.toggleChecked(result.current.items[0]!.id));
    act(() => result.current.toggleChecked(result.current.items[1]!.id));

    act(() => result.current.clearCompleted());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]!.name).toBe("Butter");
  });

  it("persists across a fresh hook instance (simulating a page refresh)", () => {
    const first = renderHook(() => useGroceryList());
    act(() => {
      first.result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    act(() => first.result.current.toggleChecked(first.result.current.items[0]!.id));

    const second = renderHook(() => useGroceryList());

    expect(second.result.current.items).toHaveLength(3);
    expect(second.result.current.items.find((item) => item.name === "Spaghetti")?.checked).toBe(true);
    expect(second.result.current.items[0]!.sourceRecipe.dishName).toBe(RECIPE_A.dishName);
  });

  it("removed and cleared items do not come back for a fresh hook instance", () => {
    const first = renderHook(() => useGroceryList());
    act(() => {
      first.result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    const [spaghetti, garlic] = first.result.current.items;
    act(() => first.result.current.removeItem(spaghetti!.id));
    act(() => first.result.current.toggleChecked(garlic!.id));
    act(() => first.result.current.clearCompleted());

    // Spaghetti (removed) and Garlic (checked, then cleared) are gone; Butter, never
    // touched, is the one item that should legitimately still be there.
    const second = renderHook(() => useGroceryList());
    expect(second.result.current.items).toHaveLength(1);
    expect(second.result.current.items[0]!.name).toBe("Butter");
  });

  it("does not crash when localStorage holds corrupted data", () => {
    window.localStorage.setItem(GROCERY_STORAGE_KEY, "not valid json{{{");
    const { result } = renderHook(() => useGroceryList());
    expect(result.current.items).toEqual([]);
  });

  it("regenerating (i.e. simply not touching the grocery list) never erases existing items", () => {
    const { result } = renderHook(() => useGroceryList());
    act(() => {
      result.current.addIngredients(PASTA_INGREDIENTS, RECIPE_A);
    });
    // Adding a second, unrelated recipe's ingredients (what happens on regenerate +
    // "Add ingredients") must not touch the first recipe's items.
    act(() => {
      result.current.addIngredients([{ name: "Tomatoes", amount: "4" }], RECIPE_B);
    });

    expect(result.current.items).toHaveLength(4);
    expect(result.current.items.filter((item) => item.sourceRecipe.id === RECIPE_A.id)).toHaveLength(3);
  });
});
