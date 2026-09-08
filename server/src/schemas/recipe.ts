// Runtime validation for Gemini's structured output — every field is re-validated here
// before a recipe leaves the server, never trusted on structured-output request alone.
// Field limits are generous but bounded, so a single pathological response can't balloon
// the payload.
import { Type, type Schema } from "@google/genai";
import { z } from "zod";
import { MOODS, type Mood } from "../types/domain.js";

const PREP_EFFORTS = ["low", "medium", "high"] as const;

/** AI-estimated, per serving — never lab-measured. Bounded to plausible per-serving
 * ranges for a home-cooked meal, the same "generous but bounded" philosophy as every
 * other field here, so one pathological Gemini response can't slip through. */
const nutritionSchema = z.object({
  calories: z.number().int().min(0).max(3000),
  proteinG: z.number().min(0).max(300),
  carbohydratesG: z.number().min(0).max(500),
  fatG: z.number().min(0).max(300),
  fiberG: z.number().min(0).max(100),
});

export const recipeContentSchema = z.object({
  detectedMood: z.enum(MOODS as [Mood, ...Mood[]]),
  mealIntent: z.object({
    prepEffort: z.enum(PREP_EFFORTS),
    style: z.string().trim().min(1).max(40),
  }),
  dishName: z.string().trim().min(1).max(80),
  reasoning: z.string().trim().min(1).max(500),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        amount: z.string().trim().min(1).max(40),
      }),
    )
    .min(1)
    .max(20),
  instructions: z.array(z.string().trim().min(1).max(300)).min(1).max(15),
  prepTime: z.string().trim().min(1).max(30),
  tags: z.array(z.string().trim().min(1).max(24)).max(8),
  chefTip: z.string().trim().min(1).max(300),
  /** How many servings the recipe as written makes — required alongside `nutrition`
   * (below) for every NEW generation, since "nutrition per serving" is only meaningful
   * with a serving count attached. Older, already-persisted recipes predate both fields
   * entirely; see client/src/schemas/recipe.ts, where they're optional instead, for that
   * backward-compatibility boundary — this server-side schema only ever validates a
   * *fresh* Gemini response, never a previously-saved one. */
  servings: z.number().int().min(1).max(12),
  nutrition: nutritionSchema,
});

export type RecipeContent = z.infer<typeof recipeContentSchema>;

/**
 * The Gemini-native structured-output schema, hand-written to mirror
 * `recipeContentSchema` above field-for-field (Gemini's schema format is a constrained
 * OpenAPI subset with its own `Type` enum, not JSON Schema, so it can't be derived
 * automatically from the zod schema — keep the two in sync by hand when either changes).
 * `minItems`/`maxItems` are strings because that's what the SDK's `Schema` type expects.
 */
export const GEMINI_RECIPE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedMood: {
      type: Type.STRING,
      enum: [...MOODS],
      description:
        "If a mood was explicitly selected in the request, echo it exactly. Otherwise infer the single best-fitting mood from the user's text and quick picks.",
    },
    mealIntent: {
      type: Type.OBJECT,
      properties: {
        prepEffort: { type: Type.STRING, enum: [...PREP_EFFORTS] },
        style: {
          type: Type.STRING,
          description: "A short 1-2 word style descriptor, e.g. comforting, light, hearty, fresh, quick.",
        },
      },
      required: ["prepEffort", "style"],
    },
    dishName: { type: Type.STRING },
    reasoning: {
      type: Type.STRING,
      description:
        "1-3 short sentences connecting the dish to the user's mood/request. Food-focused only, never a medical or mental-health claim.",
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING, description: "e.g. '200 g', '1 cup', '2 tbsp'." },
        },
        required: ["name", "amount"],
      },
      minItems: "1",
      maxItems: "12",
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Reasonably concise, sequential cooking steps.",
      minItems: "1",
      maxItems: "10",
    },
    prepTime: { type: Type.STRING, description: "e.g. '20 min'." },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A small number of short descriptors, e.g. 'Comforting', 'Quick', 'Vegetarian'.",
      maxItems: "6",
    },
    chefTip: { type: Type.STRING, description: "One concise, genuinely useful tip for this specific recipe." },
    servings: {
      type: Type.INTEGER,
      description: "How many servings this recipe as written makes, e.g. 2, 4.",
    },
    nutrition: {
      type: Type.OBJECT,
      description:
        "Your best reasonable ESTIMATE of nutrition per single serving (not the whole recipe) — never claim lab-level precision.",
      properties: {
        calories: { type: Type.INTEGER, description: "Estimated kcal per serving." },
        proteinG: { type: Type.NUMBER, description: "Estimated grams of protein per serving." },
        carbohydratesG: { type: Type.NUMBER, description: "Estimated grams of carbohydrates per serving." },
        fatG: { type: Type.NUMBER, description: "Estimated grams of fat per serving." },
        fiberG: { type: Type.NUMBER, description: "Estimated grams of fiber per serving." },
      },
      required: ["calories", "proteinG", "carbohydratesG", "fatG", "fiberG"],
    },
  },
  required: [
    "detectedMood",
    "mealIntent",
    "dishName",
    "reasoning",
    "ingredients",
    "instructions",
    "prepTime",
    "tags",
    "chefTip",
    "servings",
    "nutrition",
  ],
};
