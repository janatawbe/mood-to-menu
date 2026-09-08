import { beforeEach, describe, expect, it } from "vitest";
import type { Recipe, RecipeHistoryEntry } from "../types/domain";
import { RECIPE_HISTORY_LIMIT, RECIPE_HISTORY_STORAGE_KEY, loadRecipeHistory, saveRecipeHistory } from "./recipeHistoryStorage";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    detectedMood: "cozy",
    mealIntent: { prepEffort: "medium", style: "hearty" },
    dishName: "Root Vegetable Stew",
    reasoning: "A slow, hearty stew fits a cozy evening in.",
    ingredients: [{ name: "Carrots", amount: "3 large" }],
    instructions: ["Chop.", "Simmer."],
    prepTime: "50 min",
    tags: ["Hearty"],
    chefTip: "Add a splash of vinegar before serving.",
    ...overrides,
  };
}

function makeEntry(overrides: Partial<RecipeHistoryEntry> = {}): RecipeHistoryEntry {
  return {
    recipe: makeRecipe(),
    generatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadRecipeHistory", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadRecipeHistory()).toEqual([]);
  });

  it("round-trips entries saved via saveRecipeHistory", () => {
    const entries = [makeEntry(), makeEntry({ recipe: makeRecipe({ id: "recipe-2", dishName: "Lemon Chicken" }) })];
    saveRecipeHistory(entries);
    expect(loadRecipeHistory()).toEqual(entries);
  });

  it("round-trips nutrition/servings for a history entry that has them (Milestone 9)", () => {
    const entry = makeEntry({
      recipe: makeRecipe({ servings: 4, nutrition: { calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 } }),
    });
    saveRecipeHistory([entry]);
    expect(loadRecipeHistory()).toEqual([entry]);
  });

  it("still loads an old history entry with no nutrition/servings at all (backward compatibility)", () => {
    const oldEntry = { recipe: makeRecipe(), generatedAt: "2025-06-01T00:00:00.000Z" };
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify([oldEntry]));

    const loaded = loadRecipeHistory();
    expect(loaded).toEqual([oldEntry]);
    expect(loaded[0]?.recipe.nutrition).toBeUndefined();
  });

  it("does not crash and returns an empty list for invalid JSON", () => {
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, "{not valid json");
    expect(loadRecipeHistory()).toEqual([]);
  });

  it("does not crash and returns an empty list when the stored value isn't an array", () => {
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify({ oops: "not an array" }));
    expect(loadRecipeHistory()).toEqual([]);
  });

  it("drops individually malformed entries while preserving valid ones", () => {
    const valid = makeEntry();
    const corrupted = [valid, { recipe: { totally: "wrong shape" }, generatedAt: "x" }, { recipe: makeRecipe() }, null, "a string"];
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify(corrupted));

    expect(loadRecipeHistory()).toEqual([valid]);
  });

  it("defensively re-applies the history size limit on load", () => {
    const entries = Array.from({ length: RECIPE_HISTORY_LIMIT + 10 }, (_, i) =>
      makeEntry({ recipe: makeRecipe({ id: `recipe-${i}` }), generatedAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z` }),
    );
    window.localStorage.setItem(RECIPE_HISTORY_STORAGE_KEY, JSON.stringify(entries));

    const loaded = loadRecipeHistory();
    expect(loaded).toHaveLength(RECIPE_HISTORY_LIMIT);
    expect(loaded).toEqual(entries.slice(0, RECIPE_HISTORY_LIMIT));
  });
});

describe("saveRecipeHistory", () => {
  it("never throws even if localStorage.setItem fails (e.g. quota exceeded)", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => saveRecipeHistory([makeEntry()])).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
