import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseGroceryListReturn } from "../../hooks/useGroceryList";
import type { GroceryItem } from "../../types/domain";
import { GroceryListScreen } from "./GroceryListScreen";

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: "item-1",
    name: "Carrots",
    amount: "3 large",
    checked: false,
    sourceRecipe: { id: "recipe-1", dishName: "Root Vegetable Stew" },
    addedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeGroceryList(items: GroceryItem[] = [], overrides: Partial<UseGroceryListReturn> = {}): UseGroceryListReturn {
  const checked = items.filter((item) => item.checked).length;
  return {
    items,
    summary: { total: items.length, checked, remaining: items.length - checked },
    addIngredients: vi.fn().mockReturnValue(0),
    addIngredient: vi.fn().mockReturnValue(false),
    isIngredientAdded: vi.fn().mockReturnValue(false),
    toggleChecked: vi.fn(),
    removeItem: vi.fn(),
    clearCompleted: vi.fn(),
    clearAll: vi.fn(),
    ...overrides,
  };
}

describe("GroceryListScreen", () => {
  it("shows the empty state with a 'Go to Today's Menu' CTA when a recipe already exists", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([])}
        hasRecipe
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByText(/your grocery list is empty/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to today's menu/i })).toBeInTheDocument();
  });

  it("shows a 'Start a Vibe Check' CTA in the empty state when no recipe exists yet", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([])}
        hasRecipe={false}
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /start a vibe check/i })).toBeInTheDocument();
  });

  it("renders each item's name, amount, and source recipe", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([makeItem()])}
        hasRecipe
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByText("Carrots")).toBeInTheDocument();
    expect(screen.getByText("3 large")).toBeInTheDocument();
    expect(screen.getByText(/from root vegetable stew/i)).toBeInTheDocument();
  });

  it("shows the summary counts", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([makeItem({ id: "1" }), makeItem({ id: "2", checked: true })])}
        hasRecipe
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByText(/2 items · 1 checked · 1 left/i)).toBeInTheDocument();
  });

  it("toggling the checkbox calls toggleChecked with that item's id", () => {
    const groceryList = makeGroceryList([makeItem()]);
    render(<GroceryListScreen groceryList={groceryList} hasRecipe onGoToTodaysMenu={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("checkbox", { name: /mark carrots as done/i }));

    expect(groceryList.toggleChecked).toHaveBeenCalledWith("item-1");
  });

  it("removing an item calls removeItem with that item's id", () => {
    const groceryList = makeGroceryList([makeItem()]);
    render(<GroceryListScreen groceryList={groceryList} hasRecipe onGoToTodaysMenu={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /remove carrots/i }));

    expect(groceryList.removeItem).toHaveBeenCalledWith("item-1");
  });

  it("Clear completed is disabled when nothing is checked, and calls clearCompleted when enabled", () => {
    const groceryList = makeGroceryList([makeItem({ checked: true })]);
    render(<GroceryListScreen groceryList={groceryList} hasRecipe onGoToTodaysMenu={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    const button = screen.getByRole("button", { name: /clear completed/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(groceryList.clearCompleted).toHaveBeenCalled();
  });

  it("Clear completed is disabled when there are no checked items", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([makeItem({ checked: false })])}
        hasRecipe
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /clear completed/i })).toBeDisabled();
  });

  it("Clear all asks for confirmation before actually clearing", () => {
    const groceryList = makeGroceryList([makeItem()]);
    render(<GroceryListScreen groceryList={groceryList} hasRecipe onGoToTodaysMenu={vi.fn()} onGoToVibeCheck={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /^clear all$/i }));
    expect(groceryList.clearAll).not.toHaveBeenCalled();
    expect(screen.getByText(/remove all items\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /yes, clear all/i }));
    expect(groceryList.clearAll).toHaveBeenCalledTimes(1);
  });

  it("groups items under category headings", () => {
    render(
      <GroceryListScreen
        groceryList={makeGroceryList([makeItem({ name: "Carrots" }), makeItem({ id: "2", name: "Chicken breast" })])}
        hasRecipe
        onGoToTodaysMenu={vi.fn()}
        onGoToVibeCheck={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: "Produce" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Meat & Protein" })).toBeInTheDocument();
  });
});
