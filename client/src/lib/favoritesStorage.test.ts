// Tests Favorites localStorage persistence and validation.
import { beforeEach, describe, expect, it } from "vitest";
import type { FavoriteRecipe, Recipe } from "../types/domain";
import { FAVORITES_STORAGE_KEY, loadFavorites, saveFavorites } from "./favoritesStorage";

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

function makeFavorite(overrides: Partial<FavoriteRecipe> = {}): FavoriteRecipe {
  return {
    recipe: makeRecipe(),
    savedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadFavorites", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadFavorites()).toEqual([]);
  });

  it("round-trips favorites saved via saveFavorites", () => {
    const favorites = [makeFavorite(), makeFavorite({ recipe: makeRecipe({ id: "recipe-2", dishName: "Lemon Chicken" }) })];
    saveFavorites(favorites);
    expect(loadFavorites()).toEqual(favorites);
  });

  it("round-trips nutrition/servings for a favorite that has them", () => {
    const favorite = makeFavorite({
      recipe: makeRecipe({ servings: 4, nutrition: { calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 } }),
    });
    saveFavorites([favorite]);
    expect(loadFavorites()).toEqual([favorite]);
  });

  it("still loads an old favorite with no nutrition/servings at all (backward compatibility)", () => {
    // No `nutrition`/`servings` keys present at all — simulates a favorite persisted
    // before those fields existed.
    const oldFavorite = { recipe: makeRecipe(), savedAt: "2025-06-01T00:00:00.000Z" };
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([oldFavorite]));

    const loaded = loadFavorites();
    expect(loaded).toEqual([oldFavorite]);
    expect(loaded[0]?.recipe.nutrition).toBeUndefined();
  });

  it("does not crash and returns an empty list for invalid JSON", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, "{not valid json");
    expect(loadFavorites()).toEqual([]);
  });

  it("does not crash and returns an empty list when the stored value isn't an array", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ oops: "not an array" }));
    expect(loadFavorites()).toEqual([]);
  });

  it("drops individually malformed entries while preserving valid ones", () => {
    const valid = makeFavorite();
    const corrupted = [valid, { recipe: { totally: "wrong shape" }, savedAt: "x" }, { recipe: makeRecipe() }, null, "a string"];
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(corrupted));

    expect(loadFavorites()).toEqual([valid]);
  });

  it("rejects an entry with an empty-string dishName instead of coercing it", () => {
    const badEntry = makeFavorite({ recipe: makeRecipe({ dishName: "" }) });
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([badEntry]));

    expect(loadFavorites()).toEqual([]);
  });
});

describe("saveFavorites", () => {
  it("never throws even if localStorage.setItem fails (e.g. quota exceeded)", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => saveFavorites([makeFavorite()])).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
