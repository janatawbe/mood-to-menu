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

describe("AppShell taste memory integration", () => {
  it("Taste Memory nav opens the real screen and becomes the active nav item", () => {
    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));

    expect(screen.getByRole("heading", { name: "Taste Memory" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^taste memory$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /^grocery list$/i })).not.toHaveAttribute("aria-current");
  });

  it("preferences saved in Taste Memory are sent with the next Vibe Check generation", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);

    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Avocado" })); // liked ingredient suggestion
    fireEvent.click(screen.getByRole("button", { name: "Mushrooms" })); // disliked ingredient suggestion
    fireEvent.click(screen.getByRole("button", { name: "Vegetarian" })); // dietary suggestion

    fireEvent.click(screen.getByRole("button", { name: /^vibe check$/i }));
    await generateFromVibeCheck();

    await waitFor(() => expect(generateRecipeMock).toHaveBeenCalled());
    expect(generateRecipeMock.mock.calls[0]?.[0]).toMatchObject({
      tastePreferences: {
        favoriteComfortFoods: [],
        likedIngredients: ["Avocado"],
        dislikedIngredients: ["Mushrooms"],
        dietaryPreferences: ["Vegetarian"],
      },
    });
  });

  it("preferences persist across a fresh AppShell mount (simulating a refresh)", () => {
    const first = render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Pasta" }));
    first.unmount();

    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    expect(screen.getByRole("button", { name: "Pasta" })).toHaveAttribute("aria-pressed", "true");
  });

  it("regenerating after editing Taste Memory uses the newest preferences", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "First Dish" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("First Dish")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Cilantro" }));

    fireEvent.click(screen.getByRole("button", { name: /^today's menu$/i }));
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ dishName: "Second Dish" }));
    fireEvent.click(screen.getByRole("button", { name: /^regenerate$/i }));
    await waitFor(() => expect(screen.getByText("Second Dish")).toBeInTheDocument());

    expect(generateRecipeMock.mock.calls[1]?.[0]).toMatchObject({
      tastePreferences: { dislikedIngredients: ["Cilantro"] },
    });
  });

  it("changing Taste Memory does not affect the Grocery List", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /add ingredients to grocery list/i }));

    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Soup" }));

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getByText("Pasta")).toBeInTheDocument();
    expect(screen.getByText(/1 item · 0 checked · 1 left/i)).toBeInTheDocument();
  });
});

describe("AppShell favorites & recipe history integration", () => {
  it("a successful generation is recorded in Recipe History", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
    expect(screen.queryByText(/no recipe history yet/i)).not.toBeInTheDocument();
  });

  it("a failed generation is never recorded in Recipe History", async () => {
    generateRecipeMock.mockRejectedValueOnce(new RecipeApiError("TIMEOUT", "raw"));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText(/took too long/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    expect(screen.getByText(/no recipe history yet/i)).toBeInTheDocument();
  });

  it("regenerating adds a second, separate History entry and keeps the first", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ id: "r1", dishName: "First Dish" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("First Dish")).toBeInTheDocument());

    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ id: "r2", dishName: "Second Dish" }));
    fireEvent.click(screen.getByRole("button", { name: /^regenerate$/i }));
    await waitFor(() => expect(screen.getByText("Second Dish")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    expect(screen.getByText("First Dish")).toBeInTheDocument();
    expect(screen.getByText("Second Dish")).toBeInTheDocument();
  });

  it("favoriting a recipe from Today's Menu makes it appear on the Favorites screen and persists across a fresh mount", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    const first = render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));
    expect(screen.getByRole("button", { name: /saved to favorites/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
    first.unmount();

    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
  });

  it("opening a Favorite renders the complete recipe with no additional Gemini request, and Regenerate is disabled", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));

    fireEvent.click(screen.getByRole("button", { name: /^vibe check$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));

    expect(generateRecipeMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));

    // Reopening reuses the existing Today's Menu rendering — same ingredients/steps/chef
    // tip visible — and must not have made a second API call.
    expect(screen.getByRole("button", { name: /today's menu/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
    expect(screen.getByText("Boil pasta.")).toBeInTheDocument();
    expect(generateRecipeMock).toHaveBeenCalledTimes(1);

    const regenerateButton = screen.getByRole("button", { name: /^regenerate$/i });
    expect(regenerateButton).toBeDisabled();
  });

  it("unfavoriting removes it from Favorites but leaves Recipe History untouched", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));

    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove creamy garlic butter pasta from favorites/i }));
    expect(screen.getByText(/favorites are waiting to happen/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
  });

  it("removing a Recipe History entry leaves Favorites untouched", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove creamy garlic butter pasta from history/i }));
    expect(screen.getByText(/no recipe history yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();
  });

  it("Clear History empties History but leaves Favorites, Grocery List, and Taste Memory untouched", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe());
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));
    fireEvent.click(screen.getByRole("button", { name: /add ingredients to grocery list/i }));

    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    fireEvent.click(screen.getByRole("button", { name: "Pasta" }));

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^clear history$/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, clear history/i }));
    expect(screen.getByText(/no recipe history yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getByText("Pasta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^taste memory$/i }));
    expect(screen.getByRole("button", { name: "Pasta" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opening a reopened recipe and adding a grocery ingredient attributes it to the reopened recipe's id", async () => {
    generateRecipeMock.mockResolvedValueOnce(makeRecipe({ id: "r1" }));
    render(<AppShell chefIntroReady={false} />);
    await generateFromVibeCheck();
    await waitFor(() => expect(screen.getByText("Creamy Garlic Butter Pasta")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /save to favorites/i }));

    fireEvent.click(screen.getByRole("button", { name: /^vibe check$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    fireEvent.click(screen.getByRole("button", { name: /open recipe/i }));

    fireEvent.click(screen.getByRole("button", { name: /add pasta to grocery list/i }));

    fireEvent.click(screen.getByRole("button", { name: /^grocery list$/i }));
    expect(screen.getByText(/from creamy garlic butter pasta/i)).toBeInTheDocument();
  });

  it("Favorites and Recipe History nav entries become the active nav item when opened", () => {
    render(<AppShell chefIntroReady={false} />);
    fireEvent.click(screen.getByRole("button", { name: /^favorites$/i }));
    expect(screen.getByRole("heading", { name: "Favorites" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^favorites$/i })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: /^recipe history$/i }));
    expect(screen.getByRole("heading", { name: "Recipe History" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^recipe history$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /^favorites$/i })).not.toHaveAttribute("aria-current");
  });
});
