// Tests the useFavorites hook: add/remove and persistence.
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Recipe } from "../types/domain";
import { useFavorites } from "./useFavorites";

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

describe("useFavorites", () => {
  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorited("recipe-1")).toBe(false);
  });

  it("addFavorite adds a recipe, newest first", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(makeRecipe({ id: "r1" })));
    act(() => result.current.addFavorite(makeRecipe({ id: "r2" })));

    expect(result.current.favorites.map((f) => f.recipe.id)).toEqual(["r2", "r1"]);
    expect(result.current.isFavorited("r1")).toBe(true);
  });

  it("addFavorite is a no-op if the recipe id is already saved", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(makeRecipe({ id: "r1" })));
    act(() => result.current.addFavorite(makeRecipe({ id: "r1" })));

    expect(result.current.favorites).toHaveLength(1);
  });

  it("removeFavorite removes only the matching recipe", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.addFavorite(makeRecipe({ id: "r1" })));
    act(() => result.current.addFavorite(makeRecipe({ id: "r2" })));
    act(() => result.current.removeFavorite("r1"));

    expect(result.current.favorites.map((f) => f.recipe.id)).toEqual(["r2"]);
    expect(result.current.isFavorited("r1")).toBe(false);
  });

  it("toggleFavorite adds when absent and removes when present", () => {
    const { result } = renderHook(() => useFavorites());
    const recipe = makeRecipe({ id: "r1" });

    act(() => result.current.toggleFavorite(recipe));
    expect(result.current.isFavorited("r1")).toBe(true);

    act(() => result.current.toggleFavorite(recipe));
    expect(result.current.isFavorited("r1")).toBe(false);
  });

  it("persists across a fresh hook instance", () => {
    const first = renderHook(() => useFavorites());
    act(() => first.result.current.addFavorite(makeRecipe({ id: "r1" })));

    const second = renderHook(() => useFavorites());
    expect(second.result.current.isFavorited("r1")).toBe(true);
  });
});
