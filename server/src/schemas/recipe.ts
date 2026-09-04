import { Type, type Schema } from "@google/genai";
import { z } from "zod";
import { MOODS, type Mood } from "../types/domain.js";

const PREP_EFFORTS = ["low", "medium", "high"] as const;

/**
 * Runtime validation for Gemini's structured output. Requesting structured output (see
 * ../services/gemini/schema.ts) makes malformed JSON unlikely, but the provider is never
 * trusted solely on that basis — every field is re-validated here before a recipe is
 * allowed to leave the server. Field limits are generous but bounded, so a single
 * pathological response can't balloon the payload.
 */
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
  ],
};
