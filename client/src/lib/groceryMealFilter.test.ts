import { describe, expect, it } from "vitest";
import type { GroceryItem } from "../types/domain";
import { ALL_MEALS, deriveMealOptions, filterGroceryItemsByMeal } from "./groceryMealFilter";

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: "item-1",
    name: "Carrots",
    amount: "3 large",
    checked: false,
    sourceRecipe: { id: "recipe-1", dishName: "Root Vegetable Stew" },
    addedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveMealOptions", () => {
  it("returns an empty array for an empty list", () => {
    expect(deriveMealOptions([])).toEqual([]);
  });

  it("returns one entry per distinct source recipe id, first-seen order", () => {
    const items = [
      makeItem({ id: "1", sourceRecipe: { id: "r1", dishName: "Root Vegetable Stew" } }),
      makeItem({ id: "2", sourceRecipe: { id: "r2", dishName: "Lemon Herb Chicken" } }),
      makeItem({ id: "3", sourceRecipe: { id: "r1", dishName: "Root Vegetable Stew" } }),
    ];
    expect(deriveMealOptions(items)).toEqual([
      { id: "r1", dishName: "Root Vegetable Stew" },
      { id: "r2", dishName: "Lemon Herb Chicken" },
    ]);
  });

  it("only ever shows a duplicate recipe id once, even with many items from it", () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({ id: `item-${i}`, name: `Ingredient ${i}`, sourceRecipe: { id: "r1", dishName: "Root Vegetable Stew" } }),
    );
    expect(deriveMealOptions(items)).toHaveLength(1);
  });
});

describe("filterGroceryItemsByMeal", () => {
  const items = [
    makeItem({ id: "1", sourceRecipe: { id: "r1", dishName: "Root Vegetable Stew" } }),
    makeItem({ id: "2", sourceRecipe: { id: "r2", dishName: "Lemon Herb Chicken" } }),
    makeItem({ id: "3", sourceRecipe: { id: "r1", dishName: "Root Vegetable Stew" } }),
  ];

  it("returns every item, unchanged, for ALL_MEALS", () => {
    expect(filterGroceryItemsByMeal(items, ALL_MEALS)).toEqual(items);
  });

  it("returns only the items belonging to the selected recipe id", () => {
    const result = filterGroceryItemsByMeal(items, "r1");
    expect(result.map((item) => item.id)).toEqual(["1", "3"]);
  });

  it("returns a different subset for a different recipe id", () => {
    const result = filterGroceryItemsByMeal(items, "r2");
    expect(result.map((item) => item.id)).toEqual(["2"]);
  });

  it("returns an empty array for a recipe id with no matching items", () => {
    expect(filterGroceryItemsByMeal(items, "nonexistent")).toEqual([]);
  });

  it("never mutates or reorders the input array", () => {
    const original = [...items];
    filterGroceryItemsByMeal(items, "r1");
    expect(items).toEqual(original);
  });
});
