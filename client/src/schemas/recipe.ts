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
 * The one shared definition of "what a valid Recipe object looks like" on the client —
 * mirrors the server's recipeContentSchema (server/src/schemas/recipe.ts) plus the
 * server-generated `id`. Reused by the API response parser (services/api.ts) and by
 * Favorites/Recipe History storage validation (Milestone 8), so there's exactly one
 * place that defines this shape instead of drifting duplicate copies.
 *
 * `servings`/`nutrition` are `.optional()` — unlike the server's own required fields —
 * specifically so this same schema keeps validating Favorites/Recipe History entries
 * already persisted in localStorage from before Milestone 9, which predate both fields
 * entirely. A live API response always has them (the server never omits them for a
 * fresh generation), so making them optional here costs nothing for new recipes and
 * only relaxes what's tolerated for old ones.
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
