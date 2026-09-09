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

/**
 * A recipe shared in the public "Recently Generated" feed — mirrors the server's own
 * `PublicRecipe` (server/src/types/domain.ts), fetched from GET /api/public-recipes.
 * Deliberately its own type, not a variant of `Recipe`: it never carries `reasoning`
 * (which may reference the mood/request that produced it), so it is never passed to a
 * component expecting a full `Recipe`.
 */
export interface PublicRecipe {
  id: string;
  dishName: string;
  detectedMood: Mood;
  mealIntent: MealIntent;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prepTime: string;
  tags: string[];
  chefTip: string;
  servings: number;
  nutrition: RecipeNutrition;
  /** ISO timestamp, set by the server when the public copy was saved. */
  generatedAt: string;
}

/**
 * A public recipe a user has saved to their own Favorites. Deliberately a separate type
 * from `FavoriteRecipe` (which wraps a full `Recipe`, requiring `reasoning`) rather than
 * a union — `PublicRecipe` has no `reasoning` at all, so it can never satisfy `Recipe`'s
 * contract, and none should be faked just to reuse `FavoriteRecipe`'s storage. See
 * `usePublicFavorites`/`publicFavoritesStorage.ts` for the parallel (but independent)
 * storage this type uses — the original Favorites data/storage are untouched.
 */
export interface PublicFavoriteRecipe {
  recipe: PublicRecipe;
  /** ISO timestamp, set once when first saved. */
  savedAt: string;
}
