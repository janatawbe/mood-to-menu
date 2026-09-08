// Tests search/mood filtering for Favorites and Recipe History.
import { describe, expect, it } from "vitest";
import type { Recipe } from "../types/domain";
import { filterSavedRecipes } from "./savedRecipeSearch";

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
    tags: ["Hearty", "Comforting"],
    chefTip: "Add a splash of vinegar before serving.",
    ...overrides,
  };
}

const stew = { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew", detectedMood: "cozy", tags: ["Hearty"] }) };
const salad = { recipe: makeRecipe({ id: "r2", dishName: "Lemon Herb Chicken Salad", detectedMood: "happy", tags: ["Light", "Quick"] }) };
const entries = [stew, salad];

describe("filterSavedRecipes", () => {
  it("returns everything when query is empty and mood is 'all'", () => {
    expect(filterSavedRecipes(entries, "", "all")).toEqual(entries);
  });

  it("matches by dish name, case-insensitively", () => {
    expect(filterSavedRecipes(entries, "stew", "all")).toEqual([stew]);
    expect(filterSavedRecipes(entries, "STEW", "all")).toEqual([stew]);
  });

  it("matches by mood name in the query text", () => {
    expect(filterSavedRecipes(entries, "cozy", "all")).toEqual([stew]);
  });

  it("matches by tag", () => {
    expect(filterSavedRecipes(entries, "quick", "all")).toEqual([salad]);
  });

  it("filters by the mood dropdown", () => {
    expect(filterSavedRecipes(entries, "", "happy")).toEqual([salad]);
  });

  it("combines mood filter and search query", () => {
    expect(filterSavedRecipes(entries, "salad", "happy")).toEqual([salad]);
    expect(filterSavedRecipes(entries, "salad", "cozy")).toEqual([]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterSavedRecipes(entries, "pizza", "all")).toEqual([]);
  });

  it("trims whitespace in the query", () => {
    expect(filterSavedRecipes(entries, "  stew  ", "all")).toEqual([stew]);
  });
});
