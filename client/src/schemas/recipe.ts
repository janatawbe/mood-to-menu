import { z } from "zod";
import type { Mood } from "../types/domain";

const MOODS = ["calm", "stressed", "tired", "happy", "energetic", "cozy"] as const satisfies readonly Mood[];

const nutritionSchema = z.object({
  calories: z.number(),
  proteinG: z.number(),
  carbohydratesG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
});

/**
 * The one shared definition of a valid Recipe on the client — mirrors the server's
 * recipeContentSchema plus the server-generated `id`. Used by the API response parser
 * and by Favorites/Recipe History storage validation.
 *
 * `servings`/`nutrition` are `.optional()` here (unlike the server's required fields) so
 * this same schema still validates Favorites/History entries persisted before those
 * fields existed — a live API response always includes them.
 */
export const recipeSchema = z.object({
  id: z.string().min(1),
  detectedMood: z.enum(MOODS),
  mealIntent: z.object({
    prepEffort: z.enum(["low", "medium", "high"]),
    style: z.string().min(1),
  }),
  dishName: z.string().min(1),
  reasoning: z.string().min(1),
  ingredients: z.array(z.object({ name: z.string().min(1), amount: z.string().min(1) })).min(1),
  instructions: z.array(z.string().min(1)).min(1),
  prepTime: z.string().min(1),
  tags: z.array(z.string().min(1)),
  chefTip: z.string().min(1),
  servings: z.number().optional(),
  nutrition: nutritionSchema.optional(),
});
