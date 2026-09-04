export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

/**
 * The shape of a single Vibe Check submission — everything the mood-input screen
 * collects, and (eventually) the payload Milestone 4 sends to the Gemini backend.
 * Deliberately just data: no UI/phase state lives here.
 */
export interface VibeCheck {
  selectedMood: Mood | null;
  userText: string;
  quickInputs: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  checked?: boolean;
}

export interface Recipe {
  id: string;
  dishName: string;
  reasoning: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  tags: string[];
  mood: Mood;
}

export interface TastePreferences {
  favoriteComfortFoods: string[];
  likedIngredients: string[];
  dislikedIngredients: string[];
  dietaryPreferences: string[];
}
