// Tests public-recipe Favorites localStorage persistence and validation.
import { beforeEach, describe, expect, it } from "vitest";
import type { PublicFavoriteRecipe, PublicRecipe } from "../types/domain";
import { loadPublicFavorites, PUBLIC_FAVORITES_STORAGE_KEY, savePublicFavorites } from "./publicFavoritesStorage";

function makePublicRecipe(overrides: Partial<PublicRecipe> = {}): PublicRecipe {
  return {
    id: "pr-1",
    dishName: "Root Vegetable Stew",
    detectedMood: "cozy",
    mealIntent: { prepEffort: "medium", style: "hearty" },
    ingredients: [{ name: "Carrots", amount: "3 large" }],
    instructions: ["Chop.", "Simmer."],
    prepTime: "50 min",
    tags: ["Hearty"],
    chefTip: "Add a splash of vinegar before serving.",
    servings: 4,
    nutrition: { calories: 420, proteinG: 12, carbohydratesG: 55, fatG: 14, fiberG: 9 },
    generatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeFavorite(overrides: Partial<PublicFavoriteRecipe> = {}): PublicFavoriteRecipe {
  return {
    recipe: makePublicRecipe(),
    savedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadPublicFavorites", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadPublicFavorites()).toEqual([]);
  });

  it("round-trips favorites saved via savePublicFavorites", () => {
    const favorites = [
      makeFavorite(),
      makeFavorite({ recipe: makePublicRecipe({ id: "pr-2", dishName: "Lemon Chicken" }) }),
    ];
    savePublicFavorites(favorites);
    expect(loadPublicFavorites()).toEqual(favorites);
  });

  it("does not crash and returns an empty list for invalid JSON", () => {
    window.localStorage.setItem(PUBLIC_FAVORITES_STORAGE_KEY, "{not valid json");
    expect(loadPublicFavorites()).toEqual([]);
  });

  it("does not crash and returns an empty list when the stored value isn't an array", () => {
    window.localStorage.setItem(PUBLIC_FAVORITES_STORAGE_KEY, JSON.stringify({ oops: "not an array" }));
    expect(loadPublicFavorites()).toEqual([]);
  });

  it("drops individually malformed entries while preserving valid ones", () => {
    const valid = makeFavorite();
    const corrupted = [valid, { recipe: { totally: "wrong shape" }, savedAt: "x" }, { recipe: makePublicRecipe() }, null];
    window.localStorage.setItem(PUBLIC_FAVORITES_STORAGE_KEY, JSON.stringify(corrupted));

    expect(loadPublicFavorites()).toEqual([valid]);
  });

  it("rejects a stored entry carrying an unexpected extra field (e.g. a leaked reasoning)", () => {
    const leaky = { recipe: { ...makePublicRecipe(), reasoning: "should never be here" }, savedAt: "2026-01-01T00:00:00.000Z" };
    window.localStorage.setItem(PUBLIC_FAVORITES_STORAGE_KEY, JSON.stringify([leaky]));

    expect(loadPublicFavorites()).toEqual([]);
  });
});

describe("savePublicFavorites", () => {
  it("never throws even if localStorage.setItem fails (e.g. quota exceeded)", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => savePublicFavorites([makeFavorite()])).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
