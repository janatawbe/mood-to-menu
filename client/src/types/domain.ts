export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

/**
 * The shape of a single Vibe Check submission — everything the mood-input screen
 * collects, sent as the request body to POST /api/recipes/generate (see
 * ../services/api.ts). Deliberately just data: no UI/phase state lives here.
 */
export interface VibeCheck {
  selectedMood: Mood | null;
  userText: string;
  quickInputs: string[];
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

/** Mirrors server/src/types/domain.ts's `Recipe` — there is no shared package in this
 * workspace, so this shape is kept in sync by hand, the same way `Mood` already is. */
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
