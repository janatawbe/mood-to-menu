import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseFavoritesReturn } from "../../hooks/useFavorites";
import type { FavoriteRecipe, Recipe } from "../../types/domain";
import { FavoritesScreen } from "./FavoritesScreen";

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

function makeFavoritesState(favorites: FavoriteRecipe[] = [], overrides: Partial<UseFavoritesReturn> = {}): UseFavoritesReturn {
  return {
    favorites,
    isFavorited: vi.fn().mockReturnValue(false),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    toggleFavorite: vi.fn(),
    ...overrides,
  };
}

describe("FavoritesScreen", () => {
  it("shows the empty state with a 'Go to Today's Menu' CTA when a recipe already exists", () => {
    render(
      <FavoritesScreen
        favorites={makeFavoritesState()}
        hasRecipe
        onOpenRecipe={vi.fn()}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to today's menu/i })).toBeInTheDocument();
  });

  it("shows a 'Start a Vibe Check' CTA in the empty state when no recipe exists yet", () => {
    render(
      <FavoritesScreen
        favorites={makeFavoritesState()}
        hasRecipe={false}
        onOpenRecipe={vi.fn()}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /start a vibe check/i })).toBeInTheDocument();
  });

  it("renders a card for each favorited recipe", () => {
    const favorites = [
      { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), savedAt: "2026-01-01T00:00:00.000Z" },
      { recipe: makeRecipe({ id: "r2", dishName: "Lemon Herb Chicken Salad" }), savedAt: "2026-01-02T00:00:00.000Z" },
    ];
    render(
      <FavoritesScreen
        favorites={makeFavoritesState(favorites)}
        hasRecipe
        onOpenRecipe={vi.fn()}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByText("Root Vegetable Stew")).toBeInTheDocument();
    expect(screen.getByText("Lemon Herb Chicken Salad")).toBeInTheDocument();
  });

  it("Open recipe calls onOpenRecipe with that recipe", () => {
    const recipe = makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" });
    const onOpenRecipe = vi.fn();
    render(
      <FavoritesScreen
        favorites={makeFavoritesState([{ recipe, savedAt: "2026-01-01T00:00:00.000Z" }])}
        hasRecipe
        onOpenRecipe={onOpenRecipe}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));

    expect(onOpenRecipe).toHaveBeenCalledWith(recipe);
  });

  it("Remove calls removeFavorite with that recipe's id", () => {
    const favoritesState = makeFavoritesState([
      { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), savedAt: "2026-01-01T00:00:00.000Z" },
    ]);
    render(
      <FavoritesScreen favorites={favoritesState} hasRecipe onOpenRecipe={vi.fn()} onGoToTodaysMenu={vi.fn()} onGoToVibeCheck={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remove root vegetable stew from favorites/i }));

    expect(favoritesState.removeFavorite).toHaveBeenCalledWith("r1");
  });

  it("filters by search text, distinct from the true empty state", () => {
    const favorites = [
      { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), savedAt: "2026-01-01T00:00:00.000Z" },
      { recipe: makeRecipe({ id: "r2", dishName: "Lemon Herb Chicken Salad" }), savedAt: "2026-01-02T00:00:00.000Z" },
    ];
    render(
      <FavoritesScreen
        favorites={makeFavoritesState(favorites)}
        hasRecipe
        onOpenRecipe={vi.fn()}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/search favorites/i), { target: { value: "salad" } });

    expect(screen.getByText("Lemon Herb Chicken Salad")).toBeInTheDocument();
    expect(screen.queryByText("Root Vegetable Stew")).not.toBeInTheDocument();
  });

  it("shows a no-search-results state (not the empty state) when a search matches nothing", () => {
    const favorites = [{ recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), savedAt: "2026-01-01T00:00:00.000Z" }];
    render(
      <FavoritesScreen
        favorites={makeFavoritesState(favorites)}
        hasRecipe
        onOpenRecipe={vi.fn()}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/search favorites/i), { target: { value: "pizza" } });

    expect(screen.getByText(/no recipes match your search/i)).toBeInTheDocument();
    expect(screen.queryByText(/no favorites yet/i)).not.toBeInTheDocument();
  });
});
