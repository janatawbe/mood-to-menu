// Runtime validation for a stored/exposed public recipe entry. `.strict()` on purpose:
// an entry carrying any unexpected field (e.g. a `reasoning` that slipped through) is
// rejected outright rather than silently persisted or served with the extra key stripped.
import { z } from "zod";
import { MOODS, type Mood } from "../types/domain.js";

const PREP_EFFORTS = ["low", "medium", "high"] as const;

export const publicRecipeSchema = z
  .object({
    id: z.string().min(1),
    dishName: z.string().trim().min(1).max(80),
    detectedMood: z.enum(MOODS as [Mood, ...Mood[]]),
    mealIntent: z
      .object({
        prepEffort: z.enum(PREP_EFFORTS),
        style: z.string().trim().min(1).max(40),
      })
      .strict(),
    ingredients: z
      .array(z.object({ name: z.string().trim().min(1).max(80), amount: z.string().trim().min(1).max(40) }).strict())
      .min(1)
      .max(20),
    instructions: z.array(z.string().trim().min(1).max(300)).min(1).max(15),
    prepTime: z.string().trim().min(1).max(30),
    tags: z.array(z.string().trim().min(1).max(24)).max(8),
    chefTip: z.string().trim().min(1).max(300),
    servings: z.number().int().min(1).max(12),
    nutrition: z
      .object({
        calories: z.number().int().min(0).max(3000),
        proteinG: z.number().min(0).max(300),
        carbohydratesG: z.number().min(0).max(500),
        fatG: z.number().min(0).max(300),
        fiberG: z.number().min(0).max(100),
      })
      .strict(),
    generatedAt: z.string().min(1),
  })
  .strict();
