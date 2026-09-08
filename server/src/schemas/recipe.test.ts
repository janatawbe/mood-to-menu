// Tests recipe response schema validation, including nutrition/servings.
import { describe, expect, it } from "vitest";
import { recipeContentSchema } from "./recipe.js";

function validRecipe() {
  return {
    detectedMood: "tired",
    mealIntent: { prepEffort: "low", style: "comforting" },
    dishName: "Creamy Chicken Rice Bowl",
    reasoning: "A warm, low-effort meal for a day when cooking feels like too much.",
    ingredients: [{ name: "Chicken breast", amount: "200 g" }],
    instructions: ["Cook the rice.", "Prepare the chicken."],
    prepTime: "20 min",
    tags: ["Comforting", "Quick"],
    chefTip: "Use pre-cooked rice to save time.",
    servings: 2,
    nutrition: { calories: 520, proteinG: 32, carbohydratesG: 55, fatG: 16, fiberG: 4 },
  };
}

describe("recipeContentSchema", () => {
  it("accepts a valid Gemini recipe", () => {
    const result = recipeContentSchema.safeParse(validRecipe());
    expect(result.success).toBe(true);
  });

  it("rejects a missing dishName", () => {
    const recipe: Record<string, unknown> = validRecipe();
    delete recipe.dishName;
    const result = recipeContentSchema.safeParse(recipe);
    expect(result.success).toBe(false);
  });

  it("rejects an empty dishName", () => {
    const result = recipeContentSchema.safeParse({ ...validRecipe(), dishName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid ingredients (missing amount)", () => {
    const result = recipeContentSchema.safeParse({
      ...validRecipe(),
      ingredients: [{ name: "Chicken breast" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects ingredients that isn't an array", () => {
    const result = recipeContentSchema.safeParse({ ...validRecipe(), ingredients: "chicken" });
    expect(result.success).toBe(false);
  });

  it("rejects empty instructions", () => {
    const result = recipeContentSchema.safeParse({ ...validRecipe(), instructions: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid detectedMood", () => {
    const result = recipeContentSchema.safeParse({ ...validRecipe(), detectedMood: "furious" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed nested mealIntent (bad prepEffort)", () => {
    const result = recipeContentSchema.safeParse({
      ...validRecipe(),
      mealIntent: { prepEffort: "extreme", style: "comforting" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed nested mealIntent (missing style)", () => {
    const result = recipeContentSchema.safeParse({
      ...validRecipe(),
      mealIntent: { prepEffort: "low" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized ingredients array", () => {
    const result = recipeContentSchema.safeParse({
      ...validRecipe(),
      ingredients: Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, amount: "1" })),
    });
    expect(result.success).toBe(false);
  });

  describe("nutrition and servings", () => {
    it("rejects a missing nutrition object", () => {
      const recipe: Record<string, unknown> = validRecipe();
      delete recipe.nutrition;
      expect(recipeContentSchema.safeParse(recipe).success).toBe(false);
    });

    it("rejects a missing servings count", () => {
      const recipe: Record<string, unknown> = validRecipe();
      delete recipe.servings;
      expect(recipeContentSchema.safeParse(recipe).success).toBe(false);
    });

    it("rejects an incomplete nutrition object (missing fiberG)", () => {
      const result = recipeContentSchema.safeParse({
        ...validRecipe(),
        nutrition: { calories: 520, proteinG: 32, carbohydratesG: 55, fatG: 16 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects a negative nutrition value", () => {
      const result = recipeContentSchema.safeParse({
        ...validRecipe(),
        nutrition: { calories: 400, proteinG: -5, carbohydratesG: 40, fatG: 10, fiberG: 3 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects an implausibly large calorie estimate", () => {
      const result = recipeContentSchema.safeParse({
        ...validRecipe(),
        nutrition: { calories: 50_000, proteinG: 32, carbohydratesG: 55, fatG: 16, fiberG: 4 },
      });
      expect(result.success).toBe(false);
    });

    it("rejects a zero or negative servings count", () => {
      expect(recipeContentSchema.safeParse({ ...validRecipe(), servings: 0 }).success).toBe(false);
      expect(recipeContentSchema.safeParse({ ...validRecipe(), servings: -2 }).success).toBe(false);
    });

    it("accepts a plausible nutrition object and servings count", () => {
      const result = recipeContentSchema.safeParse(validRecipe());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.servings).toBe(2);
        expect(result.data.nutrition).toEqual({ calories: 520, proteinG: 32, carbohydratesG: 55, fatG: 16, fiberG: 4 });
      }
    });
  });
});
