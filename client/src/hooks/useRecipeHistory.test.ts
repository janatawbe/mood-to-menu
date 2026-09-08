// Tests the useRecipeHistory hook: recording and clearing entries.
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { RECIPE_HISTORY_LIMIT } from "../lib/recipeHistoryStorage";
import type { Recipe } from "../types/domain";
import { useRecipeHistory } from "./useRecipeHistory";

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

beforeEach(() => {
  window.localStorage.clear();
});

describe("useRecipeHistory", () => {
  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => useRecipeHistory());
    expect(result.current.history).toEqual([]);
  });

  it("recordGeneration prepends a new entry, newest first", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => result.current.recordGeneration(makeRecipe({ id: "r1" })));
    act(() => result.current.recordGeneration(makeRecipe({ id: "r2" })));

    expect(result.current.history.map((h) => h.recipe.id)).toEqual(["r2", "r1"]);
  });

  it("recordGeneration is a no-op if the recipe id already exists anywhere in history", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => result.current.recordGeneration(makeRecipe({ id: "r1" })));
    act(() => result.current.recordGeneration(makeRecipe({ id: "r2" })));
    act(() => result.current.recordGeneration(makeRecipe({ id: "r1" })));

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history.map((h) => h.recipe.id)).toEqual(["r2", "r1"]);
  });

  it("removeEntry removes only the matching recipe", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => result.current.recordGeneration(makeRecipe({ id: "r1" })));
    act(() => result.current.recordGeneration(makeRecipe({ id: "r2" })));
    act(() => result.current.removeEntry("r1"));

    expect(result.current.history.map((h) => h.recipe.id)).toEqual(["r2"]);
  });

  it("clearHistory empties the list", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => result.current.recordGeneration(makeRecipe({ id: "r1" })));
    act(() => result.current.clearHistory());

    expect(result.current.history).toEqual([]);
  });

  it("caps at RECIPE_HISTORY_LIMIT, dropping the oldest entry", () => {
    const { result } = renderHook(() => useRecipeHistory());
    act(() => {
      for (let i = 0; i < RECIPE_HISTORY_LIMIT + 1; i++) {
        result.current.recordGeneration(makeRecipe({ id: `r${i}` }));
      }
    });

    expect(result.current.history).toHaveLength(RECIPE_HISTORY_LIMIT);
    expect(result.current.history.map((h) => h.recipe.id)).not.toContain("r0");
    expect(result.current.history[0]?.recipe.id).toBe(`r${RECIPE_HISTORY_LIMIT}`);
  });

  it("persists across a fresh hook instance", () => {
    const first = renderHook(() => useRecipeHistory());
    act(() => first.result.current.recordGeneration(makeRecipe({ id: "r1" })));

    const second = renderHook(() => useRecipeHistory());
    expect(second.result.current.history.map((h) => h.recipe.id)).toEqual(["r1"]);
  });
});
