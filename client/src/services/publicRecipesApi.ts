// Typed fetch wrapper for the public "Recently Generated" feed.
import { z } from "zod";
import { publicRecipeSchema } from "../schemas/publicRecipe";
import type { PublicRecipe } from "../types/domain";

const responseShapeSchema = z.object({ recipes: z.array(z.unknown()) });

/** A friendly, already-safe-to-display error for the "Recently Generated" section only —
 * unrelated to `RecipeApiError`, since a public-feed failure never affects generation. */
export class PublicRecipesApiError extends Error {}

const REQUEST_TIMEOUT_MS = 15_000;
const FAILED_TO_LOAD_MESSAGE = "Couldn't load recently generated recipes right now.";

export async function getRecentPublicRecipes(): Promise<PublicRecipe[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/public-recipes", { signal: controller.signal });
  } catch {
    throw new PublicRecipesApiError(FAILED_TO_LOAD_MESSAGE);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new PublicRecipesApiError(FAILED_TO_LOAD_MESSAGE);
  }

  const body = responseShapeSchema.safeParse(await response.json().catch(() => undefined));
  if (!body.success) {
    throw new PublicRecipesApiError(FAILED_TO_LOAD_MESSAGE);
  }

  // Individually invalid entries (including one carrying an unexpected field, like a
  // leaked `reasoning`) are dropped rather than failing the whole feed.
  const valid: PublicRecipe[] = [];
  for (const entry of body.data.recipes) {
    const parsed = publicRecipeSchema.safeParse(entry);
    if (parsed.success) valid.push(parsed.data);
  }
  return valid;
}
