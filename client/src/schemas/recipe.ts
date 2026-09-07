import { z } from "zod";
import type { Mood } from "../types/domain";

const MOODS = ["calm", "stressed", "tired", "happy", "energetic", "cozy"] as const satisfies readonly Mood[];

/**
 * The one shared definition of "what a valid Recipe object looks like" on the client —
 * mirrors the server's recipeContentSchema (server/src/schemas/recipe.ts) plus the
 * server-generated `id`. Reused by the API response parser (services/api.ts) and by
 * Favorites/Recipe History storage validation (Milestone 8), so there's exactly one
 * place that defines this shape instead of drifting duplicate copies.
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
});
