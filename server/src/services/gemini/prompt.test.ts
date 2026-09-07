import { describe, expect, it } from "vitest";
import type { VibeCheckRequest } from "../../schemas/vibeCheck.js";
import { buildUserContent, EMPATHETIC_CHEF_SYSTEM_PROMPT } from "./prompt.js";

const EMPTY_TASTE_PREFERENCES = {
  favoriteComfortFoods: [],
  likedIngredients: [],
  dislikedIngredients: [],
  dietaryPreferences: [],
};

function makeInput(overrides: Partial<VibeCheckRequest> = {}): VibeCheckRequest {
  return {
    selectedMood: "tired",
    userText: "I had a long day.",
    quickInputs: [],
    tastePreferences: EMPTY_TASTE_PREFERENCES,
    ...overrides,
  };
}

describe("buildUserContent — Taste Memory section", () => {
  it("omits the USER TASTE MEMORY section entirely when every list is empty", () => {
    const content = buildUserContent(makeInput());
    expect(content).not.toContain("USER TASTE MEMORY");
  });

  it("includes liked ingredients framed as a soft preference", () => {
    const content = buildUserContent(
      makeInput({ tastePreferences: { ...EMPTY_TASTE_PREFERENCES, likedIngredients: ["avocado"] } }),
    );
    expect(content).toContain("USER TASTE MEMORY");
    expect(content).toMatch(/liked ingredients.*soft preference/i);
    expect(content).toContain("avocado");
  });

  it("includes favorite comfort foods framed as soft inspiration", () => {
    const content = buildUserContent(
      makeInput({ tastePreferences: { ...EMPTY_TASTE_PREFERENCES, favoriteComfortFoods: ["Pasta", "Soup"] } }),
    );
    expect(content).toMatch(/favorite comfort foods.*soft inspiration/i);
    expect(content).toContain("Pasta, Soup");
  });

  it("includes disliked ingredients framed as an avoidance instruction", () => {
    const content = buildUserContent(
      makeInput({ tastePreferences: { ...EMPTY_TASTE_PREFERENCES, dislikedIngredients: ["mushrooms"] } }),
    );
    expect(content).toMatch(/disliked ingredients.*avoid/i);
    expect(content).toContain("mushrooms");
  });

  it("includes dietary preferences framed as something that must be respected", () => {
    const content = buildUserContent(
      makeInput({ tastePreferences: { ...EMPTY_TASTE_PREFERENCES, dietaryPreferences: ["vegetarian"] } }),
    );
    expect(content).toMatch(/dietary preferences.*must respect/i);
    expect(content).toContain("vegetarian");
  });

  it("only includes the non-empty lists, not empty section headers for the rest", () => {
    const content = buildUserContent(
      makeInput({ tastePreferences: { ...EMPTY_TASTE_PREFERENCES, dislikedIngredients: ["olives"] } }),
    );
    expect(content).toContain("Disliked ingredients");
    expect(content).not.toContain("Liked ingredients");
    expect(content).not.toContain("Favorite comfort foods");
    expect(content).not.toContain("Dietary preferences");
  });

  it("includes every list at once when all four are populated", () => {
    const content = buildUserContent(
      makeInput({
        tastePreferences: {
          favoriteComfortFoods: ["Pasta"],
          likedIngredients: ["chicken"],
          dislikedIngredients: ["mushrooms"],
          dietaryPreferences: ["vegetarian"],
        },
      }),
    );
    expect(content).toContain("Pasta");
    expect(content).toContain("chicken");
    expect(content).toContain("mushrooms");
    expect(content).toContain("vegetarian");
  });

  it("still includes the current explicit request text alongside Taste Memory", () => {
    const content = buildUserContent(
      makeInput({
        userText: "Actually, give me a mushroom pasta.",
        tastePreferences: { ...EMPTY_TASTE_PREFERENCES, dislikedIngredients: ["mushrooms"] },
      }),
    );
    expect(content).toContain("Actually, give me a mushroom pasta.");
    expect(content).toContain("mushrooms");
  });
});

describe("system prompt — Taste Memory precedence", () => {
  it("states the precedence order: current request, then dietary/dislikes, then soft likes", () => {
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).toMatch(/current explicit request in THIS Vibe Check/i);
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).toMatch(/dietary preferences and disliked ingredients are strong/i);
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).toMatch(/liked ingredients and favorite comfort foods are soft inspiration/i);
  });

  it("states a dietary preference outranks a conflicting liked ingredient", () => {
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).toMatch(/dietary preference outranks a liked ingredient/i);
  });

  it("never claims medical/allergy protection for Taste Memory", () => {
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).toMatch(/not medical or allergy information/i);
    expect(EMPATHETIC_CHEF_SYSTEM_PROMPT).not.toMatch(/allergy safe|medically safe|guarantees? (allergen|allergy) safety is true/i);
  });
});
