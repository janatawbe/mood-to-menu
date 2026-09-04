import { z } from "zod";
import type { Mood, Recipe, VibeCheck } from "../types/domain";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return healthResponseSchema.parse(await response.json());
}

const MOODS = ["calm", "stressed", "tired", "happy", "energetic", "cozy"] as const satisfies readonly Mood[];

/** Mirrors the server's recipeContentSchema (server/src/schemas/recipe.ts) — the
 * frontend never trusts a 200 response's shape just because the backend already
 * validated it; this is cheap insurance against a future backend/frontend drift. */
const recipeResponseSchema = z.object({
  recipe: z.object({
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
  }),
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
  }),
});

export type RecipeErrorCode =
  | "INVALID_REQUEST"
  | "CONFIG_ERROR"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_OUTPUT"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR";

/** A friendly, already-safe-to-display error — the frontend never needs to touch a raw
 * provider message or stack trace, the backend has already translated it. */
export class RecipeApiError extends Error {
  readonly code: RecipeErrorCode;

  constructor(code: RecipeErrorCode, message: string) {
    super(message);
    this.name = "RecipeApiError";
    this.code = code;
  }
}

/** Safety-net client-side timeout, comfortably longer than the backend's own worst case
 * (one 20s Gemini attempt, plus one corrective retry) so it only fires if the backend
 * itself hangs in a way its own timeout didn't catch. */
const REQUEST_TIMEOUT_MS = 45_000;

export async function generateRecipe(vibeCheck: VibeCheck): Promise<Recipe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/recipes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vibeCheck),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new RecipeApiError("TIMEOUT", "The chef is taking a bit long with that one. Want to try again?");
    }
    throw new RecipeApiError(
      "NETWORK_ERROR",
      "Couldn't reach the kitchen — check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = errorResponseSchema.safeParse(await response.json().catch(() => undefined));
    if (body.success) {
      throw new RecipeApiError(body.data.error.code as RecipeErrorCode, body.data.error.message);
    }
    throw new RecipeApiError("INTERNAL_ERROR", "Something went wrong in the kitchen. Please try again.");
  }

  const parsed = recipeResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new RecipeApiError("INVALID_OUTPUT", "The chef couldn't quite finish that one. Want to try again?");
  }
  return parsed.data.recipe;
}
