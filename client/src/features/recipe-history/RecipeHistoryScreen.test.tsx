import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseRecipeHistoryReturn } from "../../hooks/useRecipeHistory";
import type { Recipe, RecipeHistoryEntry } from "../../types/domain";
import { RecipeHistoryScreen } from "./RecipeHistoryScreen";

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

function makeHistoryState(history: RecipeHistoryEntry[] = [], overrides: Partial<UseRecipeHistoryReturn> = {}): UseRecipeHistoryReturn {
  return {
    history,
    recordGeneration: vi.fn(),
    removeEntry: vi.fn(),
    clearHistory: vi.fn(),
    ...overrides,
  };
}

describe("RecipeHistoryScreen", () => {
  it("shows the empty state with a 'Start a Vibe Check' CTA when history is empty", () => {
    render(<RecipeHistoryScreen history={makeHistoryState()} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);
    expect(screen.getByText(/nothing cooked yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start a vibe check/i })).toBeInTheDocument();
  });

  it("does not show a 'Clear history' button when history is empty", () => {
    render(<RecipeHistoryScreen history={makeHistoryState()} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /clear history/i })).not.toBeInTheDocument();
  });

  it("groups entries under Today/Yesterday/Earlier headings", () => {
    const now = new Date();
    const today = new Date(now).toISOString();
    const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString();
    const history = [
      { recipe: makeRecipe({ id: "r1", dishName: "Today's Dish" }), generatedAt: today },
      { recipe: makeRecipe({ id: "r2", dishName: "Older Dish" }), generatedAt: twoDaysAgo },
    ];
    render(<RecipeHistoryScreen history={makeHistoryState(history)} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Earlier" })).toBeInTheDocument();
    expect(screen.getByText("Today's Dish")).toBeInTheDocument();
    expect(screen.getByText("Older Dish")).toBeInTheDocument();
  });

  it("Open recipe calls onOpenRecipe with that recipe", () => {
    const recipe = makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" });
    const onOpenRecipe = vi.fn();
    render(
      <RecipeHistoryScreen
        history={makeHistoryState([{ recipe, generatedAt: new Date().toISOString() }])}
        onOpenRecipe={onOpenRecipe}
        onGoToVibeCheck={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));

    expect(onOpenRecipe).toHaveBeenCalledWith(recipe);
  });

  it("Remove calls removeEntry with that recipe's id", () => {
    const historyState = makeHistoryState([
      { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), generatedAt: new Date().toISOString() },
    ]);
    render(<RecipeHistoryScreen history={historyState} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /remove root vegetable stew from history/i }));

    expect(historyState.removeEntry).toHaveBeenCalledWith("r1");
  });

  it("Clear history requires an inline confirmation before actually clearing", () => {
    const historyState = makeHistoryState([{ recipe: makeRecipe(), generatedAt: new Date().toISOString() }]);
    render(<RecipeHistoryScreen history={historyState} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^clear history$/i }));
    expect(historyState.clearHistory).not.toHaveBeenCalled();
    expect(screen.getByText(/remove all history\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /yes, clear history/i }));
    expect(historyState.clearHistory).toHaveBeenCalledTimes(1);
  });

  it("Cancel on the Clear history confirmation does not clear", () => {
    const historyState = makeHistoryState([{ recipe: makeRecipe(), generatedAt: new Date().toISOString() }]);
    render(<RecipeHistoryScreen history={historyState} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^clear history$/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(historyState.clearHistory).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^clear history$/i })).toBeInTheDocument();
  });

  it("filters by search text, distinct from the true empty state", () => {
    const history = [
      { recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), generatedAt: new Date().toISOString() },
      { recipe: makeRecipe({ id: "r2", dishName: "Lemon Herb Chicken Salad" }), generatedAt: new Date().toISOString() },
    ];
    render(<RecipeHistoryScreen history={makeHistoryState(history)} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/search history/i), { target: { value: "salad" } });

    expect(screen.getByText("Lemon Herb Chicken Salad")).toBeInTheDocument();
    expect(screen.queryByText("Root Vegetable Stew")).not.toBeInTheDocument();
  });

  it("shows a no-search-results state (not the empty state) when a search matches nothing", () => {
    const history = [{ recipe: makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }), generatedAt: new Date().toISOString() }];
    render(<RecipeHistoryScreen history={makeHistoryState(history)} onOpenRecipe={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/search history/i), { target: { value: "pizza" } });

    expect(screen.getByText(/no recipes match your search/i)).toBeInTheDocument();
    expect(screen.queryByText(/nothing cooked yet/i)).not.toBeInTheDocument();
  });
});
