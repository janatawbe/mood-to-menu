export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

export const MOODS: readonly Mood[] = ["calm", "stressed", "tired", "happy", "energetic", "cozy"];

/** Must be kept in sync with client/src/features/shell/quickInputData.ts — there is no
 * shared package in this workspace, so the six mood values and these five quick-input
 * labels are each duplicated once on the client and once on the server (the same
 * pattern already used for `Mood` itself). */
export const QUICK_INPUTS = [
  "Long day",
  "Need comfort",
  "Too tired to cook",
  "Healthy please",
  "Something light",
] as const;

export type QuickInput = (typeof QUICK_INPUTS)[number];

/** The Vibe Check payload the frontend sends to POST /api/recipes/generate. */
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

export interface Recipe {
  /** Generated server-side (crypto.randomUUID()) — never produced by Gemini. */
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

export interface TastePreferences {
  favoriteComfortFoods: string[];
  likedIngredients: string[];
  dislikedIngredients: string[];
  dietaryPreferences: string[];
}
