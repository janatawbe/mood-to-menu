// Tests Vibe Check request schema validation.
import { describe, expect, it } from "vitest";
import { TASTE_ENTRY_MAX_LENGTH, TASTE_LIST_MAX_ENTRIES, vibeCheckRequestSchema } from "./vibeCheck.js";

const EMPTY_TASTE_PREFERENCES = {
  favoriteComfortFoods: [],
  likedIngredients: [],
  dislikedIngredients: [],
  dietaryPreferences: [],
};

describe("vibeCheckRequestSchema", () => {
  it("accepts a mood-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ selectedMood: "tired" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        selectedMood: "tired",
        userText: "",
        quickInputs: [],
        tastePreferences: EMPTY_TASTE_PREFERENCES,
      });
    }
  });

  it("accepts a text-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "I had a long day." });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selectedMood).toBeNull();
      expect(result.data.userText).toBe("I had a long day.");
    }
  });

  it("accepts a chip-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ quickInputs: ["Long day"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quickInputs).toEqual(["Long day"]);
    }
  });

  it("accepts a combined request", () => {
    const result = vibeCheckRequestSchema.safeParse({
      selectedMood: "cozy",
      userText: "Need something warm.",
      quickInputs: ["Need comfort"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid mood", () => {
    const result = vibeCheckRequestSchema.safeParse({ selectedMood: "furious" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only request with no other signal", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognized quick input", () => {
    const result = vibeCheckRequestSchema.safeParse({ quickInputs: ["Feed me caviar"] });
    expect(result.success).toBe(false);
  });

  it("rejects oversized user text", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "a".repeat(500) });
    expect(result.success).toBe(false);
  });

  it("rejects a completely empty request", () => {
    const result = vibeCheckRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("trims userText before checking for meaningful content", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userText).toBe("hello");
    }
  });

  describe("tastePreferences", () => {
    it("is optional — missing tastePreferences is a valid request", () => {
      const result = vibeCheckRequestSchema.safeParse({ selectedMood: "tired" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tastePreferences).toEqual(EMPTY_TASTE_PREFERENCES);
      }
    });

    it("accepts empty arrays for every list", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: {
          favoriteComfortFoods: [],
          likedIngredients: [],
          dislikedIngredients: [],
          dietaryPreferences: [],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tastePreferences).toEqual(EMPTY_TASTE_PREFERENCES);
      }
    });

    it("accepts a fully populated valid tastePreferences object", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: {
          favoriteComfortFoods: ["Pasta", "Soup"],
          likedIngredients: ["avocado"],
          dislikedIngredients: ["mushrooms"],
          dietaryPreferences: ["vegetarian"],
        },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tastePreferences).toEqual({
          favoriteComfortFoods: ["Pasta", "Soup"],
          likedIngredients: ["avocado"],
          dislikedIngredients: ["mushrooms"],
          dietaryPreferences: ["vegetarian"],
        });
      }
    });

    it("rejects a non-array value for a preference list", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { likedIngredients: "avocado" },
      });
      expect(result.success).toBe(false);
    });

    it("rejects a preference list containing a non-string entry", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { likedIngredients: ["avocado", 42] },
      });
      expect(result.success).toBe(false);
    });

    it("rejects an oversized preference string", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { likedIngredients: ["a".repeat(TASTE_ENTRY_MAX_LENGTH + 1)] },
      });
      expect(result.success).toBe(false);
    });

    it("accepts a preference string right at the max length", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { likedIngredients: ["a".repeat(TASTE_ENTRY_MAX_LENGTH)] },
      });
      expect(result.success).toBe(true);
    });

    it("rejects too many entries in a single preference list", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: {
          likedIngredients: Array.from({ length: TASTE_LIST_MAX_ENTRIES + 1 }, (_, i) => `ingredient-${i}`),
        },
      });
      expect(result.success).toBe(false);
    });

    it("rejects an empty-string entry", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { dislikedIngredients: [""] },
      });
      expect(result.success).toBe(false);
    });

    it("trims whitespace on each saved entry", () => {
      const result = vibeCheckRequestSchema.safeParse({
        selectedMood: "tired",
        tastePreferences: { likedIngredients: ["  avocado  "] },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tastePreferences.likedIngredients).toEqual(["avocado"]);
      }
    });
  });
});
