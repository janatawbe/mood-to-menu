export type Mood = "calm" | "stressed" | "tired" | "happy" | "energetic" | "cozy";

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
