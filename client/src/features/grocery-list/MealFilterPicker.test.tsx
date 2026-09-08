// Tests the Grocery List meal-filter dropdown: search, selection, and keyboard nav.
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GroceryItemSourceRecipe } from "../../types/domain";
import { MealFilterPicker } from "./MealFilterPicker";

const MEALS: GroceryItemSourceRecipe[] = [
  { id: "r1", dishName: "Creamy Tomato Basil Pasta" },
  { id: "r2", dishName: "Lemon Ricotta Pancakes" },
  { id: "r3", dishName: "Garlic Butter Chicken" },
];

describe("MealFilterPicker", () => {
  it("shows 'All meals' on the trigger by default", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /all meals/i })).toBeInTheDocument();
  });

  it("shows the currently selected meal's dish name on the trigger", () => {
    render(<MealFilterPicker meals={MEALS} value="r2" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /lemon ricotta pancakes/i })).toBeInTheDocument();
  });

  it("opens on click and lists 'All meals' plus every derived meal", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    const listbox = screen.getByRole("listbox", { name: /filter by meal/i });
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(within(listbox).getByRole("option", { name: /all meals/i })).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: /creamy tomato basil pasta/i })).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: /lemon ricotta pancakes/i })).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: /garlic butter chicken/i })).toBeInTheDocument();
  });

  it("has a labeled search field when open", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));
    expect(screen.getByLabelText(/search meals/i)).toBeInTheDocument();
  });

  it("search is case-insensitive and filters the option list live", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    fireEvent.change(screen.getByLabelText(/search meals/i), { target: { value: "LEMON" } });

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByRole("option", { name: /lemon ricotta pancakes/i })).toBeInTheDocument();
    expect(within(listbox).queryByRole("option", { name: /creamy tomato basil pasta/i })).not.toBeInTheDocument();
    expect(within(listbox).queryByRole("option", { name: /garlic butter chicken/i })).not.toBeInTheDocument();
    // "All meals" itself doesn't match "lemon", so it's filtered out too.
    expect(within(listbox).queryByRole("option", { name: /^all meals$/i })).not.toBeInTheDocument();
  });

  it("shows a 'No meals found' state when the search matches nothing", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    fireEvent.change(screen.getByLabelText(/search meals/i), { target: { value: "pizza" } });

    expect(screen.getByText(/no meals found/i)).toBeInTheDocument();
  });

  it("clearing the search restores the full option list", () => {
    render(<MealFilterPicker meals={MEALS} value="all" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    const search = screen.getByLabelText(/search meals/i);
    fireEvent.change(search, { target: { value: "lemon" } });
    fireEvent.change(search, { target: { value: "" } });

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(4);
  });

  it("selecting a meal calls onChange with its recipe id and closes the picker", () => {
    const onChange = vi.fn();
    render(<MealFilterPicker meals={MEALS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    fireEvent.click(screen.getByRole("option", { name: /garlic butter chicken/i }));

    expect(onChange).toHaveBeenCalledWith("r3");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selecting 'All meals' restores everything", () => {
    const onChange = vi.fn();
    render(<MealFilterPicker meals={MEALS} value="r1" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /creamy tomato basil pasta/i }));

    fireEvent.click(screen.getByRole("option", { name: /^all meals$/i }));

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("marks the currently selected meal as aria-selected", () => {
    render(<MealFilterPicker meals={MEALS} value="r2" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /lemon ricotta pancakes/i }));

    expect(screen.getByRole("option", { name: /lemon ricotta pancakes/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /^all meals$/i })).toHaveAttribute("aria-selected", "false");
  });

  it("Escape closes the menu without calling onChange", () => {
    const onChange = vi.fn();
    render(<MealFilterPicker meals={MEALS} value="all" onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /all meals/i });
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByLabelText(/search meals/i), { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("clicking outside the menu closes it without calling onChange", () => {
    const onChange = vi.fn();
    render(<MealFilterPicker meals={MEALS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ArrowDown then Enter in the search field selects the next option", () => {
    const onChange = vi.fn();
    render(<MealFilterPicker meals={MEALS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all meals/i }));

    const search = screen.getByLabelText(/search meals/i);
    fireEvent.keyDown(search, { key: "ArrowDown" }); // moves from "All meals" to the first meal
    fireEvent.keyDown(search, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("r1");
  });

  it("automatically resets to 'All meals' when the selected meal disappears from the options", () => {
    const onChange = vi.fn();
    const { rerender } = render(<MealFilterPicker meals={MEALS} value="r2" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();

    // Simulate the last item for "r2" being removed elsewhere — it drops out of `meals`.
    rerender(<MealFilterPicker meals={MEALS.filter((meal) => meal.id !== "r2")} value="r2" onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("does not reset when the selected meal is still present", () => {
    const onChange = vi.fn();
    const { rerender } = render(<MealFilterPicker meals={MEALS} value="r1" onChange={onChange} />);
    rerender(<MealFilterPicker meals={MEALS} value="r1" onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("truncates a long dish name in the closed trigger without stretching it, and keeps the full name available via title", () => {
    const longMeal: GroceryItemSourceRecipe = {
      id: "r-long",
      dishName: "The Extremely Long Slow-Braised Winter Vegetable and Herb Stew With Extra Words",
    };
    render(<MealFilterPicker meals={[longMeal]} value="r-long" onChange={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: longMeal.dishName });
    expect(trigger).toHaveAttribute("title", longMeal.dishName);
    expect(trigger.className).toMatch(/max-w-/);
  });
});
