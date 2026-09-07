import { beforeEach, describe, expect, it } from "vitest";
import { emptyTasteMemory, loadTasteMemory, saveTasteMemory, TASTE_MEMORY_STORAGE_KEY } from "./tasteMemoryStorage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadTasteMemory", () => {
  it("returns default empty memory when nothing is stored", () => {
    expect(loadTasteMemory()).toEqual(emptyTasteMemory());
  });

  it("round-trips a valid saved memory", () => {
    const memory = {
      favoriteComfortFoods: ["Pasta", "Soup"],
      likedIngredients: ["avocado"],
      dislikedIngredients: ["mushrooms"],
      dietaryPreferences: ["vegetarian"],
    };
    saveTasteMemory(memory);
    expect(loadTasteMemory()).toEqual(memory);
  });

  it("does not crash and returns default empty memory for invalid JSON", () => {
    window.localStorage.setItem(TASTE_MEMORY_STORAGE_KEY, "{not valid json");
    expect(loadTasteMemory()).toEqual(emptyTasteMemory());
  });

  it("does not crash and returns default empty memory when the stored value isn't an object", () => {
    window.localStorage.setItem(TASTE_MEMORY_STORAGE_KEY, JSON.stringify(["just", "an", "array"]));
    expect(loadTasteMemory()).toEqual(emptyTasteMemory());
  });

  it("drops individually malformed entries per field while keeping the valid ones", () => {
    window.localStorage.setItem(
      TASTE_MEMORY_STORAGE_KEY,
      JSON.stringify({
        favoriteComfortFoods: ["Pasta", 42, "", "a".repeat(999)],
        likedIngredients: "not an array",
        dislikedIngredients: ["mushrooms", null],
        dietaryPreferences: ["vegetarian"],
      }),
    );
    expect(loadTasteMemory()).toEqual({
      favoriteComfortFoods: ["Pasta"],
      likedIngredients: [],
      dislikedIngredients: ["mushrooms"],
      dietaryPreferences: ["vegetarian"],
    });
  });

  it("de-duplicates case/whitespace-insensitively while preserving the first display casing", () => {
    window.localStorage.setItem(
      TASTE_MEMORY_STORAGE_KEY,
      JSON.stringify({
        favoriteComfortFoods: ["Pasta", " pasta ", "PASTA"],
        likedIngredients: [],
        dislikedIngredients: [],
        dietaryPreferences: [],
      }),
    );
    expect(loadTasteMemory().favoriteComfortFoods).toEqual(["Pasta"]);
  });

  it("caps each list at the maximum entry count", () => {
    const many = Array.from({ length: 30 }, (_, i) => `ingredient-${i}`);
    window.localStorage.setItem(
      TASTE_MEMORY_STORAGE_KEY,
      JSON.stringify({ favoriteComfortFoods: [], likedIngredients: many, dislikedIngredients: [], dietaryPreferences: [] }),
    );
    expect(loadTasteMemory().likedIngredients.length).toBe(20);
  });
});

describe("saveTasteMemory", () => {
  it("never throws even if localStorage.setItem fails (e.g. quota exceeded)", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => saveTasteMemory(emptyTasteMemory())).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });

  it("uses the documented versioned storage key", () => {
    expect(TASTE_MEMORY_STORAGE_KEY).toBe("mood-to-menu:taste-memory:v1");
    saveTasteMemory(emptyTasteMemory());
    expect(window.localStorage.getItem(TASTE_MEMORY_STORAGE_KEY)).not.toBeNull();
  });
});
