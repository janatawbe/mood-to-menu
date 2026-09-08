// Tests the useTasteMemory hook: preference add/remove and persistence.
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTasteMemory } from "./useTasteMemory";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useTasteMemory", () => {
  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => useTasteMemory());
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.preferences).toEqual({
      favoriteComfortFoods: [],
      likedIngredients: [],
      dislikedIngredients: [],
      dietaryPreferences: [],
    });
  });

  it("adds a comfort food", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => {
      expect(result.current.addPreference("favoriteComfortFoods", "Pasta")).toBe(true);
    });
    expect(result.current.preferences.favoriteComfortFoods).toEqual(["Pasta"]);
    expect(result.current.isEmpty).toBe(false);
  });

  it("removes a comfort food", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => result.current.addPreference("favoriteComfortFoods", "Pasta"));
    act(() => result.current.removePreference("favoriteComfortFoods", "Pasta"));
    expect(result.current.preferences.favoriteComfortFoods).toEqual([]);
  });

  it("adds and removes a liked ingredient", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => result.current.addPreference("likedIngredients", "avocado"));
    expect(result.current.preferences.likedIngredients).toEqual(["avocado"]);
    act(() => result.current.removePreference("likedIngredients", "avocado"));
    expect(result.current.preferences.likedIngredients).toEqual([]);
  });

  it("adds and removes a disliked ingredient", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => result.current.addPreference("dislikedIngredients", "mushrooms"));
    expect(result.current.preferences.dislikedIngredients).toEqual(["mushrooms"]);
    act(() => result.current.removePreference("dislikedIngredients", "mushrooms"));
    expect(result.current.preferences.dislikedIngredients).toEqual([]);
  });

  it("selects and deselects a dietary preference", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => result.current.addPreference("dietaryPreferences", "Vegetarian"));
    expect(result.current.preferences.dietaryPreferences).toEqual(["Vegetarian"]);
    act(() => result.current.removePreference("dietaryPreferences", "Vegetarian"));
    expect(result.current.preferences.dietaryPreferences).toEqual([]);
  });

  it("rejects an empty or whitespace-only entry", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => {
      expect(result.current.addPreference("likedIngredients", "   ")).toBe(false);
    });
    expect(result.current.preferences.likedIngredients).toEqual([]);
  });

  it("prevents a duplicate normalized entry", () => {
    const { result } = renderHook(() => useTasteMemory());
    act(() => result.current.addPreference("likedIngredients", "Avocado"));
    act(() => {
      expect(result.current.addPreference("likedIngredients", " AVOCADO ")).toBe(false);
    });
    expect(result.current.preferences.likedIngredients).toEqual(["Avocado"]);
  });

  it("updates state live and persists across a fresh hook instance", () => {
    const first = renderHook(() => useTasteMemory());
    act(() => first.result.current.addPreference("dislikedIngredients", "mushrooms"));

    const second = renderHook(() => useTasteMemory());
    expect(second.result.current.preferences.dislikedIngredients).toEqual(["mushrooms"]);
  });

  describe("likes/dislikes conflict resolution", () => {
    it("moves an ingredient from dislikes to likes when added as liked", () => {
      const { result } = renderHook(() => useTasteMemory());
      act(() => result.current.addPreference("dislikedIngredients", "mushrooms"));
      act(() => result.current.addPreference("likedIngredients", "mushrooms"));

      expect(result.current.preferences.likedIngredients).toEqual(["mushrooms"]);
      expect(result.current.preferences.dislikedIngredients).toEqual([]);
    });

    it("moves an ingredient from likes to dislikes when added as disliked", () => {
      const { result } = renderHook(() => useTasteMemory());
      act(() => result.current.addPreference("likedIngredients", "cilantro"));
      act(() => result.current.addPreference("dislikedIngredients", "cilantro"));

      expect(result.current.preferences.dislikedIngredients).toEqual(["cilantro"]);
      expect(result.current.preferences.likedIngredients).toEqual([]);
    });

    it("comfort foods and dietary preferences never conflict with likes/dislikes", () => {
      const { result } = renderHook(() => useTasteMemory());
      act(() => result.current.addPreference("likedIngredients", "cheese"));
      act(() => result.current.addPreference("dietaryPreferences", "cheese"));

      expect(result.current.preferences.likedIngredients).toEqual(["cheese"]);
      expect(result.current.preferences.dietaryPreferences).toEqual(["cheese"]);
    });
  });
});
