// Tests the Recently Generated screen: loading/empty/error/display states, opening a
// public recipe, and that the public detail view never shows reasoning or calls Gemini.
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UsePublicRecipesReturn } from "../../hooks/usePublicRecipes";
import type { PublicRecipe } from "../../types/domain";
import { RecentlyGeneratedScreen } from "./RecentlyGeneratedScreen";

function makePublicRecipe(overrides: Partial<PublicRecipe> = {}): PublicRecipe {
  return {
    id: "pr-1",
    dishName: "Root Vegetable Stew",
    detectedMood: "cozy",
    mealIntent: { prepEffort: "medium", style: "hearty" },
    ingredients: [{ name: "Carrots", amount: "3 large" }],
    instructions: ["Chop.", "Simmer."],
    prepTime: "50 min",
    tags: ["Hearty", "Comforting", "Vegetarian", "Extra Tag"],
    chefTip: "Add a splash of vinegar before serving.",
    servings: 4,
    nutrition: { calories: 420, proteinG: 12, carbohydratesG: 55, fatG: 14, fiberG: 9 },
    generatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeState(overrides: Partial<UsePublicRecipesReturn> = {}): UsePublicRecipesReturn {
  return {
    status: "success",
    recipes: [],
    errorMessage: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe("RecentlyGeneratedScreen", () => {
  it("shows a loading indicator while fetching", () => {
    render(<RecentlyGeneratedScreen publicRecipes={makeState({ status: "loading" })} />);
    expect(screen.getByText(/loading recently generated recipes/i)).toBeInTheDocument();
  });

  it("shows the empty state when the feed loaded successfully with no recipes", () => {
    render(<RecentlyGeneratedScreen publicRecipes={makeState({ status: "success", recipes: [] })} />);
    expect(screen.getByText(/no recipes shared yet/i)).toBeInTheDocument();
  });

  it("shows an error state with the hook's error message, and never crashes the screen", () => {
    render(
      <RecentlyGeneratedScreen
        publicRecipes={makeState({ status: "error", errorMessage: "Couldn't reach the kitchen.", recipes: [] })}
      />,
    );
    expect(screen.getByText(/couldn't load recently generated/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't reach the kitchen/i)).toBeInTheDocument();
  });

  it("calls refetch when Try again is clicked", () => {
    const refetch = vi.fn();
    render(
      <RecentlyGeneratedScreen
        publicRecipes={makeState({ status: "error", errorMessage: "Network error", recipes: [], refetch })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders a card per recipe, capped to 3 preview tags", () => {
    const recipes = [
      makePublicRecipe({ id: "pr-1", dishName: "Root Vegetable Stew" }),
      makePublicRecipe({ id: "pr-2", dishName: "Lemon Herb Chicken Salad" }),
    ];
    render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes })} />);

    expect(screen.getByText("Root Vegetable Stew")).toBeInTheDocument();
    expect(screen.getByText("Lemon Herb Chicken Salad")).toBeInTheDocument();
    // Each card shows only the first 3 of the 4 tags on the fixture recipe.
    expect(screen.getAllByText("Hearty")).toHaveLength(2);
    expect(screen.queryByText("Extra Tag")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /open recipe/i })).toHaveLength(2);
  });

  it("opening a recipe shows its full detail view without a Reasoning panel, and makes no Gemini call", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const recipe = makePublicRecipe({ id: "pr-1", dishName: "Root Vegetable Stew" });
    render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes: [recipe] })} />);

    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));

    // The full recipe renders...
    expect(screen.getByText("Ingredients")).toBeInTheDocument();
    expect(screen.getByText("Cooking Instructions")).toBeInTheDocument();
    expect(screen.getByText("Nutritional Facts")).toBeInTheDocument();
    expect(screen.getByText("Chef's Tip")).toBeInTheDocument();
    expect(screen.getByText("Shared by the community")).toBeInTheDocument();

    // ...but never the Reasoning panel (a public recipe has no `reasoning` at all).
    expect(screen.queryByText(/why this matches your mood/i)).not.toBeInTheDocument();

    // Opening a saved/public recipe is pure client-side rendering — no network call.
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("Back returns from the detail view to the gallery", () => {
    const recipe = makePublicRecipe({ id: "pr-1", dishName: "Root Vegetable Stew" });
    render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes: [recipe] })} />);

    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));
    expect(screen.getByText(/back to recently generated/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to recently generated/i }));
    expect(screen.getByRole("button", { name: /open recipe/i })).toBeInTheDocument();
  });

  describe("mood filter", () => {
    it("does not show the mood filter while loading, on error, or when the feed is truly empty", () => {
      const { rerender } = render(<RecentlyGeneratedScreen publicRecipes={makeState({ status: "loading" })} />);
      expect(screen.queryByRole("button", { name: /all moods/i })).not.toBeInTheDocument();

      rerender(<RecentlyGeneratedScreen publicRecipes={makeState({ status: "error", errorMessage: "Oops" })} />);
      expect(screen.queryByRole("button", { name: /all moods/i })).not.toBeInTheDocument();

      rerender(<RecentlyGeneratedScreen publicRecipes={makeState({ status: "success", recipes: [] })} />);
      expect(screen.queryByRole("button", { name: /all moods/i })).not.toBeInTheDocument();
    });

    it("shows the mood filter, defaulted to 'All moods', once recipes have loaded", () => {
      const recipes = [makePublicRecipe({ id: "pr-1" })];
      render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes })} />);
      expect(screen.getByRole("button", { name: /all moods/i })).toBeInTheDocument();
    });

    it("filtering by mood shows only matching cards, entirely from already-fetched data (no extra fetch)", () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);

      const recipes = [
        makePublicRecipe({ id: "pr-1", dishName: "Cozy Root Stew", detectedMood: "cozy" }),
        makePublicRecipe({ id: "pr-2", dishName: "Happy Citrus Salad", detectedMood: "happy" }),
      ];
      render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes })} />);

      fireEvent.click(screen.getByRole("button", { name: /all moods/i }));
      fireEvent.click(screen.getByRole("option", { name: /^happy$/i }));

      expect(screen.getByText("Happy Citrus Salad")).toBeInTheDocument();
      expect(screen.queryByText("Cozy Root Stew")).not.toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it("shows a no-results state (not the main empty state) when the selected mood matches nothing", () => {
      const recipes = [makePublicRecipe({ id: "pr-1", dishName: "Cozy Root Stew", detectedMood: "cozy" })];
      render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes })} />);

      fireEvent.click(screen.getByRole("button", { name: /all moods/i }));
      fireEvent.click(screen.getByRole("option", { name: /^energetic$/i }));

      expect(screen.getByText(/no recipes match that mood yet/i)).toBeInTheDocument();
      expect(screen.queryByText(/no recipes shared yet/i)).not.toBeInTheDocument();
      expect(screen.queryByText("Cozy Root Stew")).not.toBeInTheDocument();
    });

    it("'Show all moods' clears the filter and restores every card", () => {
      const recipes = [
        makePublicRecipe({ id: "pr-1", dishName: "Cozy Root Stew", detectedMood: "cozy" }),
        makePublicRecipe({ id: "pr-2", dishName: "Happy Citrus Salad", detectedMood: "happy" }),
      ];
      render(<RecentlyGeneratedScreen publicRecipes={makeState({ recipes })} />);

      fireEvent.click(screen.getByRole("button", { name: /all moods/i }));
      fireEvent.click(screen.getByRole("option", { name: /^energetic$/i }));
      expect(screen.getByText(/no recipes match that mood yet/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /show all moods/i }));

      expect(screen.getByText("Cozy Root Stew")).toBeInTheDocument();
      expect(screen.getByText("Happy Citrus Salad")).toBeInTheDocument();
    });
  });
});
