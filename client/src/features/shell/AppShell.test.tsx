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
  window.localStorage.clear();
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

    await waitFor(() => expect(screen.getByText(/current ai request limit/i)).toBeInTheDocument());
    expect(screen.getByText("Stays Visible")).toBeInTheDocument();
  });
});

describe("AppShell grocery list integration", () => {
  it("Grocery List nav opens the real screen and becomes the active nav item", () => {
    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));

    expect(screen.getByRole("heading", { name: "Grocery List" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^grocery list$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /today's menu/i })).not.toHaveAttribute("aria-current");
  });

  it("Add ingredients to Grocery List from Today's Menu shows up on the Grocery List screen", async () => {
    generateRecipeMock.mockResolvedValueOnce(
      makeRecipe({ ingredients: [{ name: "Pasta", amount: "200 g" }, { name: "Garlic", amount: "2 cloves" }] }),
    );
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /add ingredients to grocery list/i }));
    // Immediate visual confirmation on Today's Menu itself, without navigating away.
    expect(screen.getByRole("button", { name: /added to grocery list/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.getByText("Garlic")).toBeInTheDocument();
    expect(screen.getAllByText(/from creamy garlic butter pasta/i)).toHaveLength(2);
  });

  it("adding one ingredient individually updates the Grocery List without duplicating on a later Add All", async () => {
    generateRecipeMock.mockResolvedValueOnce(
      makeRecipe({ ingredients: [{ name: "Pasta", amount: "200 g" }, { name: "Garlic", amount: "2 cloves" }] }),
    );
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /add garlic to grocery list/i }));
    // The individual ingredient's own control reflects the added state immediately.
    expect(screen.getByRole("button", { name: /garlic is on your grocery list/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add ingredients to grocery list/i }));

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getAllByText("Garlic")).toHaveLength(1);
    expect(screen.getByText("Pasta")).toBeInTheDocument();
  });

  it("removing an item from the Grocery List makes it addable again from Today's Menu", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /add pasta to grocery list/i }));
    expect(screen.getByRole("button", { name: /pasta is on your grocery list/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove pasta/i }));

    fireEvent.click(screen.getByRole("button", { name: /^today's menu$/i }));
    expect(screen.getByRole("button", { name: /add pasta to grocery list/i })).toBeInTheDocument();
  });

  it("regenerating the recipe does not erase existing Grocery List items", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ id: "r1", dishName: "First Dish" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("First Dish")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /add ingredients to grocery list/i }));

    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ id: "r2", dishName: "Second Dish" }));
    fireEvent.click(screen.getByRole("button", { name: /^regenerate$/i }));
    await waitFor(() => expect(screen.getByText("Second Dish")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getByText(/from first dish/i)).toBeInTheDocument();
  });
});
