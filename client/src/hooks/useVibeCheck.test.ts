// Tests the useVibeCheck hook: state transitions and generation flow.
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe, TastePreferences } from "../types/domain";

const generateRecipeMock = vi.fn();

// Mocks the API boundary only (services/api.ts) — everything else in the hook (phase
// transitions, error mapping, regenerate isolation) runs for real. No test here makes a
// real network request.
vi.mock("../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return { ...actual, generateRecipe: (...args: unknown[]) => generateRecipeMock(...args) };
});

const { useVibeCheck } = await import("./useVibeCheck");
const { RecipeApiError } = await import("../services/api");

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    detectedMood: "happy",
    mealIntent: { prepEffort: "low", style: "light" },
    dishName: "Lemon Herb Chicken Salad",
    reasoning: "A bright, light meal for a good day.",
    ingredients: [{ name: "Chicken breast", amount: "200 g" }],
    instructions: ["Grill the chicken.", "Toss the salad."],
    prepTime: "15 min",
    tags: ["Light"],
    chefTip: "Let the chicken rest before slicing.",
    ...overrides,
  };
}

function makeTastePreferences(overrides: Partial<TastePreferences> = {}): TastePreferences {
  return {
    favoriteComfortFoods: [],
    likedIngredients: [],
    dislikedIngredients: [],
    dietaryPreferences: [],
    ...overrides,
  };
}

beforeEach(() => {
  generateRecipeMock.mockReset();
});

describe("useVibeCheck", () => {
  it("calls onGenerated after a successful initial submit", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    const onGenerated = vi.fn();
    const { result } = renderHook(() => useVibeCheck(onGenerated));

    act(() => result.current.toggleMood("happy"));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.phase).toBe("captured"));
    expect(result.current.recipe?.dishName).toBe("Lemon Herb Chicken Salad");
    expect(onGenerated).toHaveBeenCalledTimes(1);
  });

  it("sets a mapped error and does not call onGenerated when submit fails", async () => {
    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("TIMEOUT", "raw"));
    const onGenerated = vi.fn();
    const { result } = renderHook(() => useVibeCheck(onGenerated));

    act(() => result.current.setUserText("Long day."));
    act(() => result.current.submit());

    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current.error?.code).toBe("TIMEOUT");
    expect(onGenerated).not.toHaveBeenCalled();
  });

  it("retry re-submits with the preserved mood/text/chips", async () => {
    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("TIMEOUT", "raw"));
    const { result } = renderHook(() => useVibeCheck());

    act(() => result.current.setUserText("Long day, need something easy."));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.phase).toBe("error"));

    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.phase).toBe("captured"));

    expect(result.current.userText).toBe("Long day, need something easy.");
    expect(generateRecipeMock.mock.calls[1]?.[0]).toMatchObject({ userText: "Long day, need something easy." });
  });

  it("editVibeCheck returns to idle while preserving inputs and any existing recipe", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    const { result } = renderHook(() => useVibeCheck());
    act(() => result.current.toggleMood("cozy"));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.phase).toBe("captured"));

    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("TIMEOUT", "raw"));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.phase).toBe("error"));

    act(() => result.current.editVibeCheck());
    expect(result.current.phase).toBe("idle");
    expect(result.current.selectedMood).toBe("cozy");
    expect(result.current.error).toBeNull();
    expect(result.current.recipe).not.toBeNull();
  });

  it("regenerate replaces the recipe on success", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "First" }));
    const { result } = renderHook(() => useVibeCheck());
    act(() => result.current.toggleMood("happy"));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.recipe?.dishName).toBe("First"));

    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Second" }));
    await act(async () => {
      await result.current.regenerate();
    });

    expect(result.current.recipe?.dishName).toBe("Second");
    expect(result.current.regenerateError).toBeNull();
  });

  it("regenerate keeps the existing recipe and sets regenerateError on failure", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Keep me" }));
    const { result } = renderHook(() => useVibeCheck());
    act(() => result.current.toggleMood("happy"));
    act(() => result.current.submit());
    await waitFor(() => expect(result.current.recipe?.dishName).toBe("Keep me"));

    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("PROVIDER_UNAVAILABLE", "raw"));
    await act(async () => {
      await result.current.regenerate();
    });

    expect(result.current.recipe?.dishName).toBe("Keep me");
    expect(result.current.regenerateError?.code).toBe("PROVIDER_UNAVAILABLE");
    // A failed regeneration must never resurrect the initial-generation error UI.
    expect(result.current.phase).toBe("captured");
    expect(result.current.error).toBeNull();
  });

  describe("Taste Memory in the generation request", () => {
    it("submit includes the current Taste Memory in the request", async () => {
      const prefs = makeTastePreferences({ likedIngredients: ["avocado"], dislikedIngredients: ["mushrooms"], dietaryPreferences: ["vegetarian"] });
      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      const { result } = renderHook(() => useVibeCheck(undefined, prefs));

      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.phase).toBe("captured"));

      expect(generateRecipeMock.mock.calls[0]?.[0]).toMatchObject({ tastePreferences: prefs });
    });

    it("submit still works with no Taste Memory (undefined)", async () => {
      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      const { result } = renderHook(() => useVibeCheck(undefined, undefined));

      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());

      await waitFor(() => expect(result.current.phase).toBe("captured"));
      expect(generateRecipeMock.mock.calls[0]?.[0]).toMatchObject({ tastePreferences: undefined });
    });

    it("regenerate includes the current Taste Memory", async () => {
      const prefs = makeTastePreferences({ favoriteComfortFoods: ["Pasta"] });
      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      const { result } = renderHook(() => useVibeCheck(undefined, prefs));
      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.phase).toBe("captured"));

      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      await act(async () => {
        await result.current.regenerate();
      });

      expect(generateRecipeMock.mock.calls[1]?.[0]).toMatchObject({ tastePreferences: prefs });
    });

    it("changing Taste Memory before regenerating uses the newest preferences, not a stale copy", async () => {
      const initialPrefs = makeTastePreferences({ likedIngredients: ["chicken"] });
      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      const { result, rerender } = renderHook(
        ({ tastePreferences }: { tastePreferences: TastePreferences }) => useVibeCheck(undefined, tastePreferences),
        { initialProps: { tastePreferences: initialPrefs } },
      );
      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.phase).toBe("captured"));
      expect(generateRecipeMock.mock.calls[0]?.[0]).toMatchObject({ tastePreferences: initialPrefs });

      // User edits Taste Memory on its own screen — AppShell re-renders useVibeCheck
      // with the new live value, exactly like this rerender.
      const updatedPrefs = makeTastePreferences({ likedIngredients: ["chicken"], dislikedIngredients: ["olives"] });
      rerender({ tastePreferences: updatedPrefs });

      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      await act(async () => {
        await result.current.regenerate();
      });

      expect(generateRecipeMock.mock.calls[1]?.[0]).toMatchObject({ tastePreferences: updatedPrefs });
    });
  });

  describe("openRecipe", () => {
    it("displays the given recipe with no API call and marks it as reopened", () => {
      const { result } = renderHook(() => useVibeCheck());
      const saved = makeRecipe({ dishName: "Saved From Favorites" });

      act(() => result.current.openRecipe(saved));

      expect(result.current.recipe?.dishName).toBe("Saved From Favorites");
      expect(result.current.phase).toBe("captured");
      expect(result.current.isReopenedRecipe).toBe(true);
      expect(generateRecipeMock).not.toHaveBeenCalled();
    });

    it("disables canRegenerate while viewing a reopened recipe, even with a selected mood", () => {
      const { result } = renderHook(() => useVibeCheck());
      act(() => result.current.toggleMood("happy"));
      act(() => result.current.openRecipe(makeRecipe()));

      expect(result.current.canRegenerate).toBe(false);
    });

    it("a real submit after openRecipe clears isReopenedRecipe again", async () => {
      const { result } = renderHook(() => useVibeCheck());
      act(() => result.current.openRecipe(makeRecipe()));
      expect(result.current.isReopenedRecipe).toBe(true);

      generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Freshly Generated" }));
      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.recipe?.dishName).toBe("Freshly Generated"));

      expect(result.current.isReopenedRecipe).toBe(false);
    });
  });

  describe("onRecipeGenerated (Recipe History recording)", () => {
    it("fires exactly once with the recipe after a successful initial submit", async () => {
      generateRecipeMock.mockResolvedValueOnce(makeRecipe());
      const onRecipeGenerated = vi.fn();
      const { result } = renderHook(() => useVibeCheck(undefined, undefined, onRecipeGenerated));

      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.phase).toBe("captured"));

      expect(onRecipeGenerated).toHaveBeenCalledTimes(1);
      expect(onRecipeGenerated).toHaveBeenCalledWith(expect.objectContaining({ dishName: "Lemon Herb Chicken Salad" }));
    });

    it("does not fire on a failed submit", async () => {
      generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("TIMEOUT", "raw"));
      const onRecipeGenerated = vi.fn();
      const { result } = renderHook(() => useVibeCheck(undefined, undefined, onRecipeGenerated));

      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.phase).toBe("error"));

      expect(onRecipeGenerated).not.toHaveBeenCalled();
    });

    it("fires again on a successful regenerate, but not on a failed one", async () => {
      generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "First" }));
      const onRecipeGenerated = vi.fn();
      const { result } = renderHook(() => useVibeCheck(undefined, undefined, onRecipeGenerated));
      act(() => result.current.toggleMood("happy"));
      act(() => result.current.submit());
      await waitFor(() => expect(result.current.recipe?.dishName).toBe("First"));
      expect(onRecipeGenerated).toHaveBeenCalledTimes(1);

      generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("PROVIDER_UNAVAILABLE", "raw"));
      await act(async () => {
        await result.current.regenerate();
      });
      expect(onRecipeGenerated).toHaveBeenCalledTimes(1);

      generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Second" }));
      await act(async () => {
        await result.current.regenerate();
      });
      expect(onRecipeGenerated).toHaveBeenCalledTimes(2);
      expect(onRecipeGenerated).toHaveBeenLastCalledWith(expect.objectContaining({ dishName: "Second" }));
    });

    it("does not fire when a recipe is merely reopened via openRecipe", () => {
      const onRecipeGenerated = vi.fn();
      const { result } = renderHook(() => useVibeCheck(undefined, undefined, onRecipeGenerated));

      act(() => result.current.openRecipe(makeRecipe()));

      expect(onRecipeGenerated).not.toHaveBeenCalled();
    });
  });
});
