import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseTasteMemoryReturn } from "../../hooks/useTasteMemory";
import type { TastePreferences } from "../../types/domain";
import { TasteMemoryScreen } from "./TasteMemoryScreen";

function makePreferences(overrides: Partial<TastePreferences> = {}): TastePreferences {
  return {
    favoriteComfortFoods: [],
    likedIngredients: [],
    dislikedIngredients: [],
    dietaryPreferences: [],
    ...overrides,
  };
}

function makeTasteMemory(overrides: Partial<UseTasteMemoryReturn> = {}): UseTasteMemoryReturn {
  const preferences = overrides.preferences ?? makePreferences();
  const isEmpty =
    overrides.isEmpty ??
    (preferences.favoriteComfortFoods.length === 0 &&
      preferences.likedIngredients.length === 0 &&
      preferences.dislikedIngredients.length === 0 &&
      preferences.dietaryPreferences.length === 0);
  return {
    preferences,
    isEmpty,
    addPreference: vi.fn().mockReturnValue(true),
    removePreference: vi.fn(),
    ...overrides,
  };
}

describe("TasteMemoryScreen", () => {
  it("renders the empty state when no preferences are saved", () => {
    render(<TasteMemoryScreen tasteMemory={makeTasteMemory()} />);
    expect(screen.getByText(/doesn't know your favorites yet/i)).toBeInTheDocument();
  });

  it("does not render the empty state once a preference exists", () => {
    render(<TasteMemoryScreen tasteMemory={makeTasteMemory({ preferences: makePreferences({ likedIngredients: ["avocado"] }) })} />);
    expect(screen.queryByText(/doesn't know your favorites yet/i)).not.toBeInTheDocument();
  });

  it("renders all four section headings and none of Favorites/Recipe History", () => {
    render(<TasteMemoryScreen tasteMemory={makeTasteMemory()} />);
    expect(screen.getByRole("heading", { name: "Favorite comfort foods" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Liked ingredients" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Disliked ingredients" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dietary preferences" })).toBeInTheDocument();
    expect(screen.queryByText(/favorites you love will be saved/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recipe history/i)).not.toBeInTheDocument();
  });

  it("adding a custom comfort food via the input calls addPreference and clears the field", () => {
    const tasteMemory = makeTasteMemory();
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    const input = screen.getByLabelText(/add a comfort food/i);
    fireEvent.change(input, { target: { value: "Lasagna" } });
    fireEvent.click(screen.getByRole("button", { name: /^add comfort food$/i }));

    expect(tasteMemory.addPreference).toHaveBeenCalledWith("favoriteComfortFoods", "Lasagna");
    expect(input).toHaveValue("");
  });

  it("clicking a suggestion chip adds it", () => {
    const tasteMemory = makeTasteMemory();
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    fireEvent.click(screen.getByRole("button", { name: "Mushrooms" }));

    expect(tasteMemory.addPreference).toHaveBeenCalledWith("dislikedIngredients", "Mushrooms");
  });

  it("clicking an already-selected suggestion chip removes it", () => {
    const tasteMemory = makeTasteMemory({ preferences: makePreferences({ dietaryPreferences: ["Vegetarian"] }) });
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    const chip = screen.getByRole("button", { name: "Vegetarian" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);

    expect(tasteMemory.removePreference).toHaveBeenCalledWith("dietaryPreferences", "Vegetarian");
  });

  it("renders a custom saved entry as a removable chip and removing it calls removePreference", () => {
    const tasteMemory = makeTasteMemory({ preferences: makePreferences({ likedIngredients: ["truffle oil"] }) });
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    expect(screen.getByText("truffle oil")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove truffle oil/i }));

    expect(tasteMemory.removePreference).toHaveBeenCalledWith("likedIngredients", "truffle oil");
  });

  it("does not call addPreference for an empty/whitespace-only custom entry", () => {
    const tasteMemory = makeTasteMemory();
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    const input = screen.getByLabelText(/add a liked ingredient/i);
    fireEvent.change(input, { target: { value: "   " } });
    expect(screen.getByRole("button", { name: /^add liked ingredient$/i })).toBeDisabled();
  });

  it("submitting the add form via Enter also adds the entry (keyboard operable)", () => {
    const tasteMemory = makeTasteMemory();
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    const input = screen.getByLabelText(/add a dietary preference/i);
    fireEvent.change(input, { target: { value: "Low-carb" } });
    fireEvent.submit(input.closest("form")!);

    expect(tasteMemory.addPreference).toHaveBeenCalledWith("dietaryPreferences", "Low-carb");
  });

  it("shows saved values after a reload (preferences passed straight through from the hook)", () => {
    const tasteMemory = makeTasteMemory({
      preferences: makePreferences({
        favoriteComfortFoods: ["Pasta"],
        likedIngredients: ["truffle oil"],
        dislikedIngredients: ["olives"],
        dietaryPreferences: ["Vegetarian"],
      }),
    });
    render(<TasteMemoryScreen tasteMemory={tasteMemory} />);

    // Custom (non-suggested) entries render as their own removable text chips.
    expect(screen.getByText("truffle oil")).toBeInTheDocument();
    // "olives" is also a suggestion, so it renders as that toggled-on chip instead.
    expect(screen.getByRole("button", { name: "Olives" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Pasta" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Vegetarian" })).toHaveAttribute("aria-pressed", "true");
  });
});
