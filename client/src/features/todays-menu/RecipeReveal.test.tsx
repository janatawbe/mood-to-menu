import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Recipe } from "../../types/domain";
import { RecipeReveal } from "./RecipeReveal";

const baseRecipe: Recipe = {
  id: "r1",
  detectedMood: "cozy",
  mealIntent: { prepEffort: "medium", style: "hearty" },
  dishName: "Slow-Roasted Root Vegetable Stew",
  reasoning: "A slow, hearty stew fits a cozy evening in.",
  ingredients: [
    { name: "Carrots", amount: "3 large" },
    { name: "Potatoes", amount: "4 medium" },
  ],
  instructions: ["Chop the vegetables.", "Simmer for 40 minutes.", "Season to taste."],
  prepTime: "50 min",
  tags: ["Hearty", "Comforting", "Vegetarian"],
  chefTip: "Add a splash of vinegar right before serving to brighten the flavors.",
};

function renderRecipe(overrides: Partial<Recipe> = {}) {
  return render(
    <RecipeReveal
      recipe={{ ...baseRecipe, ...overrides }}
      isRegenerating={false}
      regenerateError={null}
      canRegenerate
      onRegenerate={vi.fn()}
    />,
  );
}

describe("RecipeReveal", () => {
  it("renders the dish name as the dominant heading", () => {
    renderRecipe();
    expect(screen.getByRole("heading", { name: "Slow-Roasted Root Vegetable Stew" })).toBeInTheDocument();
  });

  it("renders the mood badge, prep time, effort, and style", () => {
    renderRecipe();
    expect(screen.getByText("Cozy")).toBeInTheDocument();
    expect(screen.getByText("50 min")).toBeInTheDocument();
    expect(screen.getByText("Medium effort")).toBeInTheDocument();
    expect(screen.getByText("hearty")).toBeInTheDocument();
  });

  it("renders the reasoning under 'Why this matches your mood'", () => {
    renderRecipe();
    expect(screen.getByText(/why this matches your mood/i)).toBeInTheDocument();
    expect(screen.getByText(baseRecipe.reasoning)).toBeInTheDocument();
  });

  it("renders every ingredient", () => {
    renderRecipe();
    expect(screen.getByText("Carrots")).toBeInTheDocument();
    expect(screen.getByText("3 large")).toBeInTheDocument();
    expect(screen.getByText("Potatoes")).toBeInTheDocument();
  });

  it("renders every numbered instruction step", () => {
    renderRecipe();
    expect(screen.getByText("Chop the vegetables.")).toBeInTheDocument();
    expect(screen.getByText("Simmer for 40 minutes.")).toBeInTheDocument();
    expect(screen.getByText("Season to taste.")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders the chef's tip", () => {
    renderRecipe();
    expect(screen.getByText(/chef's tip/i)).toBeInTheDocument();
    expect(screen.getByText(baseRecipe.chefTip)).toBeInTheDocument();
  });

  it("never renders dev/debug markers or a raw JSON dump", () => {
    renderRecipe();
    expect(screen.queryByText(/\[DEV\]/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recipe received from/i)).not.toBeInTheDocument();
  });

  it("remains stable with a long dish name, many ingredients, and many steps", () => {
    renderRecipe({
      dishName:
        "The Extremely Long Slow-Braised Winter Vegetable and Herb Stew With Extra Words For Stress Testing",
      ingredients: Array.from({ length: 14 }, (_, i) => ({ name: `Ingredient ${i + 1}`, amount: `${i + 1} units` })),
      instructions: Array.from({ length: 9 }, (_, i) => `Step number ${i + 1} of the cooking process.`),
    });
    expect(screen.getByText("Ingredient 1")).toBeInTheDocument();
    expect(screen.getByText("Ingredient 14")).toBeInTheDocument();
    expect(screen.getByText("Step number 9 of the cooking process.")).toBeInTheDocument();
    expect(screen.getByText("09")).toBeInTheDocument();
  });
});
