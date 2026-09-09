// JSON-file-backed store for the public "Recently Generated" feed. Deliberately a plain
// file (per product decision) rather than a database — see server/data/README, or the
// project plan, for the accepted tradeoff: this feed resets whenever the container
// filesystem does (redeploy/replacement), which is fine for a rolling "recent activity"
// feed, not meant as a permanent archive.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { publicRecipeSchema } from "../../schemas/publicRecipe.js";
import type { PublicRecipe, Recipe } from "../../types/domain.js";

export const MAX_STORED_PUBLIC_RECIPES = 50;
export const DEFAULT_PUBLIC_RECIPES_LIMIT = 10;

// Resolved from this module's own location (not `process.cwd()`, which differs between
// `npm run dev --workspace=server` and the Docker CMD `node server/dist/index.js`) —
// stable at `server/data/public-recipes.json` whether running from `server/src` (tsx) or
// `server/dist` (production build), since both sit the same three levels below `server/`.
const DEFAULT_DATA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../data");
export const DEFAULT_PUBLIC_RECIPES_PATH = resolve(DEFAULT_DATA_DIR, "public-recipes.json");

const fileShapeSchema = z.object({ recipes: z.array(z.unknown()) });

/** Maps a full generated `Recipe` down to the approved public allow-list. The single
 * choke point that guarantees `reasoning` (and anything from the originating VibeCheck)
 * can never reach the public feed, however `Recipe` itself evolves later. */
function toPublicRecipe(recipe: Recipe): PublicRecipe {
  return {
    id: recipe.id,
    dishName: recipe.dishName,
    detectedMood: recipe.detectedMood,
    mealIntent: recipe.mealIntent,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    prepTime: recipe.prepTime,
    tags: recipe.tags,
    chefTip: recipe.chefTip,
    servings: recipe.servings,
    nutrition: recipe.nutrition,
    generatedAt: new Date().toISOString(),
  };
}

/** Reads and validates the stored file, tolerating every failure mode short of a
 * successful read: a missing file, an empty file, corrupt JSON, an unexpected top-level
 * shape, and individually malformed entries (dropped one at a time, never invalidating
 * the rest) all resolve to a best-effort valid list rather than throwing. */
function readValidPublicRecipes(filePath: string): PublicRecipe[] {
  let raw: unknown;
  try {
    const text = readFileSync(filePath, "utf-8");
    if (!text.trim()) return [];
    raw = JSON.parse(text);
  } catch {
    return [];
  }

  const shape = fileShapeSchema.safeParse(raw);
  if (!shape.success) return [];

  const valid: PublicRecipe[] = [];
  for (const entry of shape.data.recipes) {
    const parsed = publicRecipeSchema.safeParse(entry);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      console.warn("[publicRecipes] dropping malformed stored entry:", parsed.error.issues[0]?.message);
    }
  }
  return valid;
}

function sortNewestFirst(recipes: PublicRecipe[]): PublicRecipe[] {
  return [...recipes].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

/** Writes via a temp-file-then-rename so a crash mid-write can never leave a
 * half-written/corrupt JSON file behind. */
function writePublicRecipes(filePath: string, recipes: PublicRecipe[]): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify({ recipes }, null, 2), "utf-8");
  renameSync(tmpPath, filePath);
}

/**
 * Creates an independent public-recipe store bound to one JSON file — a factory (rather
 * than one module-level singleton) so tests can point separate instances at their own
 * temp files with no shared state. `publicRecipeStore` below is the real singleton the
 * app itself uses.
 */
export function createPublicRecipeStore(filePath: string = DEFAULT_PUBLIC_RECIPES_PATH) {
  function listRecent(limit: number = DEFAULT_PUBLIC_RECIPES_LIMIT): PublicRecipe[] {
    try {
      return sortNewestFirst(readValidPublicRecipes(filePath)).slice(0, limit);
    } catch (err) {
      console.error("[publicRecipes] failed to read public recipes", err);
      return [];
    }
  }

  /** Saves a safe public copy of a successful generation. Never throws — a storage
   * failure (bad path, full disk, permission error, etc.) must never be allowed to fail
   * the recipe generation request that triggered it. */
  function save(recipe: Recipe): void {
    try {
      const candidate = toPublicRecipe(recipe);
      const parsed = publicRecipeSchema.safeParse(candidate);
      if (!parsed.success) {
        console.error("[publicRecipes] refused to save an invalid public recipe:", parsed.error.issues[0]?.message);
        return;
      }

      const current = readValidPublicRecipes(filePath);
      if (current.some((entry) => entry.id === parsed.data.id)) return;

      const next = sortNewestFirst([parsed.data, ...current]).slice(0, MAX_STORED_PUBLIC_RECIPES);
      writePublicRecipes(filePath, next);
    } catch (err) {
      console.error("[publicRecipes] failed to save public recipe", err);
    }
  }

  return { save, listRecent };
}

export const publicRecipeStore = createPublicRecipeStore();
