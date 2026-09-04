import { describe, expect, it } from "vitest";
import type { GroceryItem } from "../types/domain";
import { CATEGORY_ORDER, categorizeIngredient, groupGroceryItems } from "./groceryCategories";

describe("categorizeIngredient", () => {
  it("categorizes common produce", () => {
    expect(categorizeIngredient("Carrots")).toBe("Produce");
    expect(categorizeIngredient("fresh spinach")).toBe("Produce");
  });

  it("categorizes meat and protein", () => {
    expect(categorizeIngredient("Chicken breast")).toBe("Meat & Protein");
  });

  it("categorizes dairy and eggs", () => {
    expect(categorizeIngredient("Grated Parmesan cheese")).toBe("Dairy & Eggs");
    expect(categorizeIngredient("Eggs")).toBe("Dairy & Eggs");
  });

  it("categorizes bakery items", () => {
    expect(categorizeIngredient("Tortilla")).toBe("Bakery");
  });

  it("categorizes pantry staples", () => {
    expect(categorizeIngredient("Olive oil")).toBe("Pantry");
    expect(categorizeIngredient("Spaghetti")).toBe("Pantry");
  });

  it("falls back to Pantry for an unrecognized ingredient (documented default)", () => {
    expect(categorizeIngredient("Xyzzy Sauce Blend 9000")).toBe("Pantry");
  });

  it("is case-insensitive", () => {
    expect(categorizeIngredient("CARROTS")).toBe("Produce");
  });
});

describe("groupGroceryItems", () => {
  function makeItem(name: string, id: string): GroceryItem {
    return {
      id,
      name,
      amount: "1",
      checked: false,
      sourceRecipe: { id: "r1", dishName: "Test Recipe" },
      addedAt: "2026-01-01T00:00:00.000Z",
    };
  }

  it("groups items under their category and only includes non-empty categories", () => {
    const items = [makeItem("Carrots", "1"), makeItem("Chicken breast", "2"), makeItem("Milk", "3")];
    const groups = groupGroceryItems(items);

    expect(groups.map((g) => g.category)).toEqual(["Produce", "Meat & Protein", "Dairy & Eggs"]);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });

  it("preserves the fixed category display order regardless of input order", () => {
    const items = [makeItem("Milk", "1"), makeItem("Carrots", "2")];
    const groups = groupGroceryItems(items);
    const order = groups.map((g) => g.category);
    expect(order.indexOf("Produce")).toBeLessThan(order.indexOf("Dairy & Eggs"));
    expect(CATEGORY_ORDER.indexOf("Produce")).toBeLessThan(CATEGORY_ORDER.indexOf("Dairy & Eggs"));
  });

  it("never drops an item — every item lands in some category", () => {
    const items = [makeItem("Carrots", "1"), makeItem("Something Weird", "2"), makeItem("Milk", "3")];
    const groups = groupGroceryItems(items);
    const totalGrouped = groups.reduce((sum, g) => sum + g.items.length, 0);
    expect(totalGrouped).toBe(items.length);
  });

  it("returns an empty array for an empty list", () => {
    expect(groupGroceryItems([])).toEqual([]);
  });
});
