import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Recipe } from "../../types/domain";
import { AppShell } from "./AppShell";

const generateRecipeMock = vi.fn();

vi.mock("../../services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../services/api")>();
  return { ...actual, generateRecipe: (...args: unknown[]) => generateRecipeMock(...args) };
});

const { RecipeApiError } = await import("../../services/api");

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    detectedMood: "tired",
    mealIntent: { prepEffort: "low", style: "comforting" },
    dishName: "Creamy Garlic Butter Pasta",
    reasoning: "A warm, low-effort meal for a long day.",
    ingredients: [{ name: "Pasta", amount: "200 g" }],
    instructions: ["Boil pasta.", "Toss with sauce."],
    prepTime: "15 min",
    tags: ["Comforting"],
    chefTip: "Save some pasta water for the sauce.",
    ...overrides,
  };
}

async function generateFromVibeCheck() {
  fireEvent.click(screen.getByRole("button", { name: /tired mood/i }));
  fireEvent.click(screen.getByRole("button", { name: /send vibe check/i }));
}

beforeEach(() => {
  generateRecipeMock.mockReset();
});

describe("AppShell navigation", () => {
  it("shows the Today's Menu empty state before any recipe is generated", () => {
    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /today's menu/i }));
    expect(screen.getByText(/nothing on the menu yet/i)).toBeInTheDocument();
  });

  it("navigates to Today's Menu and shows the recipe after a successful generation", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);

    await generateFromVibeCheck();

    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /today's menu/i })).toHaveAttribute("aria-current", "page");
  });

  it("returns to the Vibe Check inputs when Vibe Check nav is clicked", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^vibe check$/i }));
    expect(screen.getByLabelText(/tell me more about your day/i)).toBeInTheDocument();
  });

  it("returns to the current recipe when Today's Menu nav is clicked again", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^vibe check$/i }));
    fireEvent.click(screen.getByRole("button", { name: /today's menu/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
  });
});

describe("AppShell regenerate", () => {
  it("regenerates using the same Vibe Check signals and replaces the recipe on success", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "First Dish" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("First Dish")).toBeInTheDocument());

    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Second Dish" }));
    fireEvent.click(screen.getByRole("button", { name: /^regenerate$/i }));

    await waitFor(() => expect(screen.getByText("Second Dish")).toBeInTheDocument());
    expect(generateRecipeMock).toHaveBeenCalledTimes(2);
    expect(generateRecipeMock.mock.calls[1]?.[0]).toMatchObject({ selectedMood: "tired" });
  });

  it("keeps the current recipe visible and shows a localized error if regeneration fails", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Stays Visible" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Stays Visible")).toBeInTheDocument());

    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("RATE_LIMITED", "raw"));
    fireEvent.click(screen.getByRole("button", { name: /^regenerate$/i }));

    await waitFor(() => expect(screen.getByText(/lot of orders right now/i)).toBeInTheDocument());
    expect(screen.getByText("Stays Visible")).toBeInTheDocument();
  });
});
