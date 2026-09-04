import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "../types/domain";

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
});
