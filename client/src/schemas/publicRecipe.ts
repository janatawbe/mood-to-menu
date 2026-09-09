// Runtime validation for a public recipe entry from GET /api/public-recipes. `.strict()`
// mirrors the server's own schema: an entry carrying an unexpected field (e.g. a
// `reasoning` that shouldn't be there) is rejected rather than rendered.
import { z } from "zod";
import type { Mood } from "../types/domain";

const MOODS = ["calm", "stressed", "tired", "happy", "energetic", "cozy"] as const satisfies readonly Mood[];

export const publicRecipeSchema = z
  .object({
    id: z.string().min(1),
    dishName: z.string().min(1),
    detectedMood: z.enum(MOODS),
    mealIntent: z
      .object({
        prepEffort: z.enum(["low", "medium", "high"]),
        style: z.string().min(1),
      })
      .strict(),
    ingredients: z.array(z.object({ name: z.string().min(1), amount: z.string().min(1) }).strict()).min(1),
    instructions: z.array(z.string().min(1)).min(1),
    prepTime: z.string().min(1),
    tags: z.array(z.string().min(1)),
    chefTip: z.string().min(1),
    servings: z.number(),
    nutrition: z
      .object({
        calories: z.number(),
        proteinG: z.number(),
        carbohydratesG: z.number(),
        fatG: z.number(),
        fiberG: z.number(),
      })
      .strict(),
    generatedAt: z.string().min(1),
  })
  .strict();
