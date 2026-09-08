export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

/**
 * The shape of a single Vibe Check submission — everything the mood-input screen
 * collects, sent as the request body to POST /api/recipes/generate (see
 * ../services/api.ts). Deliberately just data: no UI/phase state lives here.
 *
 * `tastePreferences` (Milestone 7) is optional so the request stays valid for a user
 * with no saved Taste Memory — see ../hooks/useVibeCheck.ts, which always fills it in
 * from the current live `useTasteMemory()` state when present.
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

/** Mirrors server/src/types/domain.ts's `Recipe` — there is no shared package in this
 * workspace, so this shape is kept in sync by hand, the same way `Mood` already is.
 *
 * `servings`/`nutrition` (Milestone 9) are optional here — unlike the server's own
 * `Recipe`, where they're required — specifically for backward compatibility: this type
 * also describes Favorites/Recipe History entries already persisted in localStorage
 * from before this milestone, which predate both fields entirely and must keep loading,
 * opening, and working normally without them (see ../lib/favoritesStorage.ts and
 * ../lib/recipeHistoryStorage.ts). Every newly generated recipe always has both. */
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

/**
 * A single persisted grocery-list entry. Independent of `Recipe`/`RecipeIngredient` —
 * this is Milestone 6's own long-lived record, not something regeneration or navigation
 * ever clears (see ../lib/groceryStorage.ts and ../hooks/useGroceryList.ts).
 */
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

/**
 * A saved Favorite (Milestone 8) — wraps the *complete* Recipe so it can be reopened
 * later with no Gemini call, keyed by the recipe's own stable `id` (never a duplicate
 * per id). Deliberately separate from TastePreferences — favoriting a recipe never
 * writes into Taste Memory, and vice versa.
 */
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
