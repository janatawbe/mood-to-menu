import { beforeEach, describe, expect, it } from "vitest";
import type { GroceryItem } from "../types/domain";
import { GROCERY_STORAGE_KEY, loadGroceryItems, saveGroceryItems } from "./groceryStorage";

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

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadGroceryItems", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadGroceryItems()).toEqual([]);
  });

  it("round-trips items saved via saveGroceryItems", () => {
    const items = [makeItem(), makeItem({ id: "item-2", name: "Potatoes", checked: true })];
    saveGroceryItems(items);
    expect(loadGroceryItems()).toEqual(items);
  });

  it("does not crash and returns an empty list for invalid JSON", () => {
    window.localStorage.setItem(GROCERY_STORAGE_KEY, "{not valid json");
    expect(loadGroceryItems()).toEqual([]);
  });

  it("does not crash and returns an empty list when the stored value isn't an array", () => {
    window.localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify({ oops: "not an array" }));
    expect(loadGroceryItems()).toEqual([]);
  });

  it("drops individually malformed entries while preserving valid ones", () => {
    const valid = makeItem();
    const corrupted = [valid, { id: "bad", name: "" }, { totally: "wrong shape" }, null, "a string"];
    window.localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify(corrupted));

    expect(loadGroceryItems()).toEqual([valid]);
  });

  it("rejects an entry with the wrong field types instead of coercing them", () => {
    const badTypes = { ...makeItem(), checked: "yes" };
    window.localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify([badTypes]));

    expect(loadGroceryItems()).toEqual([]);
  });
});

describe("saveGroceryItems", () => {
  it("never throws even if localStorage.setItem fails (e.g. quota exceeded)", () => {
    const original = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => saveGroceryItems([makeItem()])).not.toThrow();
    } finally {
      window.localStorage.setItem = original;
    }
  });
});
