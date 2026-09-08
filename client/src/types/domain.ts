// Shared client-side domain types for Vibe Check, Recipe, Grocery List, and Taste Memory.
export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

/**
 * The shape of a single Vibe Check submission, sent as the request body to
 * POST /api/recipes/generate. Deliberately just data: no UI/phase state lives here.
 * `tastePreferences` is optional so the request stays valid with no saved Taste Memory.
 */
export interface VibeCheck {
  selectedMood: Mood | null;
  userText: string;
  quickInputs: string[];
  tastePreferences?: TastePreferences;
}

export type PrepEffort = "low" | "medium" | "high";

export interface MealIntent {
  prepEffort: PrepEffort;
  /** Short free-form style descriptor, e.g. "comforting", "light", "hearty". */
  style: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

/** AI-estimated, per single serving — never lab-measured, never used for calorie
 * targeting or a good/bad judgment about the meal (see RecipeReveal's Nutritional Facts
 * section, and the server system prompt). */
export interface RecipeNutrition {
  calories: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;
}

/** Mirrors server/src/types/domain.ts's `Recipe` — kept in sync by hand, the same way
 * `Mood` already is. `servings`/`nutrition` are optional here (unlike the server's
 * required fields) for backward compatibility with Favorites/Recipe History entries
 * persisted before those fields existed; every freshly generated recipe has both. */
export interface Recipe {
  id: string;
  detectedMood: Mood;
  mealIntent: MealIntent;
  dishName: string;
  reasoning: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: string;
  tags: string[];
  chefTip: string;
  servings?: number;
  nutrition?: RecipeNutrition;
}

export interface GroceryItemSourceRecipe {
  id: string;
  dishName: string;
}

/** A single persisted grocery-list entry — independent of `Recipe`/`RecipeIngredient`,
 * never cleared by regeneration or navigation. */
export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
  sourceRecipe: GroceryItemSourceRecipe;
  /** ISO timestamp, set once when the item is first added. */
  addedAt: string;
}

export interface TastePreferences {
  favoriteComfortFoods: string[];
  likedIngredients: string[];
  dislikedIngredients: string[];
  dietaryPreferences: string[];
}

/** A saved Favorite — wraps the *complete* Recipe so it can be reopened later with no
 * Gemini call, keyed by the recipe's own stable `id` (never a duplicate per id). */
export interface FavoriteRecipe {
  recipe: Recipe;
  /** ISO timestamp, set once when first saved. */
  savedAt: string;
}

/**
 * One successful recipe generation (initial or regenerate), recorded for Recipe History.
 * Independent of Favorites — removing/clearing one store never touches the other.
 */
export interface RecipeHistoryEntry {
  recipe: Recipe;
  /** ISO timestamp, set once when the generation succeeded. */
  generatedAt: string;
}
