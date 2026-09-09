// Tests the JSON-file-backed public recipe store: saving, ordering, limits, dedupe, and
// every documented failure mode (missing file, corrupt JSON, malformed entries, and a
// write failure) — none of which may ever throw out of `save()`.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Recipe } from "../../types/domain.js";
import { createPublicRecipeStore, MAX_STORED_PUBLIC_RECIPES } from "./store.js";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    detectedMood: "cozy",
    mealIntent: { prepEffort: "medium", style: "hearty" },
    dishName: "Root Vegetable Stew",
    reasoning: "A slow, hearty stew fits a cozy evening in — private, never persisted here.",
    ingredients: [{ name: "Carrots", amount: "3 large" }],
    instructions: ["Chop.", "Simmer."],
    prepTime: "50 min",
    tags: ["Hearty", "Comforting", "Vegetarian"],
    chefTip: "Add a splash of vinegar before serving.",
    servings: 4,
    nutrition: { calories: 420, proteinG: 12, carbohydratesG: 55, fatG: 14, fiberG: 9 },
    ...overrides,
  };
}

let dir: string;
let filePath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "public-recipes-test-"));
  filePath = join(dir, "public-recipes.json");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("publicRecipeStore", () => {
  it("saves a recipe and returns it from listRecent", () => {
    const store = createPublicRecipeStore(filePath);
    store.save(makeRecipe({ id: "r1", dishName: "Root Vegetable Stew" }));

    const recent = store.listRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0]).toMatchObject({ id: "r1", dishName: "Root Vegetable Stew" });
  });

  it("never persists reasoning or any field outside the public allow-list", () => {
    const store = createPublicRecipeStore(filePath);
    store.save(makeRecipe({ id: "r1" }));

    const stored = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(stored.recipes[0]).not.toHaveProperty("reasoning");
    expect(Object.keys(stored.recipes[0]).sort()).toEqual(
      [
        "chefTip",
        "detectedMood",
        "dishName",
        "generatedAt",
        "id",
        "ingredients",
        "instructions",
        "mealIntent",
        "nutrition",
        "prepTime",
        "servings",
        "tags",
      ].sort(),
    );
  });

  it("returns newest-first ordering", () => {
    const store = createPublicRecipeStore(filePath);
    store.save(makeRecipe({ id: "r1", dishName: "First" }));
    store.save(makeRecipe({ id: "r2", dishName: "Second" }));
    store.save(makeRecipe({ id: "r3", dishName: "Third" }));

    const recent = store.listRecent();
    expect(recent.map((r) => r.dishName)).toEqual(["Third", "Second", "First"]);
  });

  it("limits listRecent to the requested count (default 20)", () => {
    const store = createPublicRecipeStore(filePath);
    for (let i = 0; i < 25; i++) {
      store.save(makeRecipe({ id: `r${i}`, dishName: `Dish ${i}` }));
    }

    expect(store.listRecent()).toHaveLength(20);
    expect(store.listRecent(3)).toHaveLength(3);
  });

  it("caps stored recipes at MAX_STORED_PUBLIC_RECIPES, dropping the oldest", () => {
    const store = createPublicRecipeStore(filePath);
    for (let i = 0; i < MAX_STORED_PUBLIC_RECIPES + 5; i++) {
      store.save(makeRecipe({ id: `r${i}`, dishName: `Dish ${i}` }));
    }

    const all = store.listRecent(MAX_STORED_PUBLIC_RECIPES + 5);
    expect(all).toHaveLength(MAX_STORED_PUBLIC_RECIPES);
    // The oldest 5 (r0..r4) were pushed out; the newest survives.
    expect(all.some((r) => r.id === "r0")).toBe(false);
    expect(all.some((r) => r.id === `r${MAX_STORED_PUBLIC_RECIPES + 4}`)).toBe(true);
  });

  it("does not insert a duplicate entry for the same recipe id", () => {
    const store = createPublicRecipeStore(filePath);
    store.save(makeRecipe({ id: "r1", dishName: "Original" }));
    store.save(makeRecipe({ id: "r1", dishName: "Original" }));

    expect(store.listRecent()).toHaveLength(1);
  });

  it("returns an empty list when the file does not exist", () => {
    const store = createPublicRecipeStore(filePath);
    expect(store.listRecent()).toEqual([]);
  });

  it("returns an empty list for an empty file, without throwing", () => {
    writeFileSync(filePath, "", "utf-8");
    const store = createPublicRecipeStore(filePath);
    expect(store.listRecent()).toEqual([]);
  });

  it("returns an empty list for corrupt JSON, and a later save heals the file", () => {
    writeFileSync(filePath, "{ this is not valid json", "utf-8");
    const store = createPublicRecipeStore(filePath);
    expect(store.listRecent()).toEqual([]);

    store.save(makeRecipe({ id: "r1" }));
    expect(store.listRecent()).toHaveLength(1);
  });

  it("drops individually malformed entries while keeping valid ones", () => {
    writeFileSync(
      filePath,
      JSON.stringify({
        recipes: [
          { id: "bad", dishName: "" }, // fails schema: empty dishName, missing fields
          {
            id: "good",
            dishName: "Valid Dish",
            detectedMood: "happy",
            mealIntent: { prepEffort: "low", style: "light" },
            ingredients: [{ name: "Egg", amount: "2" }],
            instructions: ["Cook."],
            prepTime: "10 min",
            tags: ["Quick"],
            chefTip: "Don't overcook.",
            servings: 1,
            nutrition: { calories: 200, proteinG: 12, carbohydratesG: 2, fatG: 14, fiberG: 0 },
            generatedAt: new Date().toISOString(),
          },
        ],
      }),
      "utf-8",
    );

    const store = createPublicRecipeStore(filePath);
    const recent = store.listRecent();
    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe("good");
  });

  it("rejects an entry carrying an unexpected extra field (e.g. a leaked reasoning)", () => {
    const validEntry = {
      id: "leaky",
      dishName: "Valid Dish",
      detectedMood: "happy",
      mealIntent: { prepEffort: "low", style: "light" },
      ingredients: [{ name: "Egg", amount: "2" }],
      instructions: ["Cook."],
      prepTime: "10 min",
      tags: ["Quick"],
      chefTip: "Don't overcook.",
      servings: 1,
      nutrition: { calories: 200, proteinG: 12, carbohydratesG: 2, fatG: 14, fiberG: 0 },
      generatedAt: new Date().toISOString(),
      reasoning: "This should never be here.",
    };
    writeFileSync(filePath, JSON.stringify({ recipes: [validEntry] }), "utf-8");

    const store = createPublicRecipeStore(filePath);
    expect(store.listRecent()).toEqual([]);
  });

  it("save() never throws, even when the target path cannot be written", () => {
    // Make a plain file stand where a directory needs to be created, forcing mkdirSync
    // (inside save's write path) to fail.
    const blockerPath = join(dir, "blocker");
    writeFileSync(blockerPath, "not a directory", "utf-8");
    const unwritableFilePath = join(blockerPath, "nested", "public-recipes.json");

    const store = createPublicRecipeStore(unwritableFilePath);
    expect(() => store.save(makeRecipe({ id: "r1" }))).not.toThrow();
    expect(store.listRecent()).toEqual([]);
  });
});
