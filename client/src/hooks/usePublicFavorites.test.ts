// Tests the usePublicFavorites hook: toggle and persistence, independent of useFavorites.
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { PublicRecipe } from "../types/domain";
import { usePublicFavorites } from "./usePublicFavorites";

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

beforeEach(() => {
  window.localStorage.clear();
});

describe("usePublicFavorites", () => {
  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => usePublicFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorited("pr-1")).toBe(false);
  });

  it("toggleFavorite adds when absent and removes when present", () => {
    const { result } = renderHook(() => usePublicFavorites());
    const recipe = makePublicRecipe({ id: "pr-1" });

    act(() => result.current.toggleFavorite(recipe));
    expect(result.current.isFavorited("pr-1")).toBe(true);

    act(() => result.current.toggleFavorite(recipe));
    expect(result.current.isFavorited("pr-1")).toBe(false);
  });

  it("toggleFavorite adds newest first", () => {
    const { result } = renderHook(() => usePublicFavorites());
    act(() => result.current.toggleFavorite(makePublicRecipe({ id: "pr-1" })));
    act(() => result.current.toggleFavorite(makePublicRecipe({ id: "pr-2" })));

    expect(result.current.favorites.map((f) => f.recipe.id)).toEqual(["pr-2", "pr-1"]);
  });

  it("persists across a fresh hook instance", () => {
    const first = renderHook(() => usePublicFavorites());
    act(() => first.result.current.toggleFavorite(makePublicRecipe({ id: "pr-1" })));

    const second = renderHook(() => usePublicFavorites());
    expect(second.result.current.isFavorited("pr-1")).toBe(true);
  });

  it("does not affect (and is not affected by) the separate full-Recipe Favorites store", async () => {
    const { useFavorites } = await import("./useFavorites");
    const publicHook = renderHook(() => usePublicFavorites());
    const favoritesHook = renderHook(() => useFavorites());

    act(() => publicHook.result.current.toggleFavorite(makePublicRecipe({ id: "pr-1" })));

    expect(favoritesHook.result.current.favorites).toEqual([]);
    expect(publicHook.result.current.isFavorited("pr-1")).toBe(true);
  });
});
