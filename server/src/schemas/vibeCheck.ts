import { z } from "zod";
import { MOODS, QUICK_INPUTS, type Mood } from "../types/domain.js";

export const VIBE_CHECK_TEXT_LIMIT = 200;

/** Milestone 7 Taste Memory limits — generous enough for real use, bounded enough that
 * a malicious/buggy client can't send a huge payload into the prompt. */
export const TASTE_ENTRY_MAX_LENGTH = 40;
export const TASTE_LIST_MAX_ENTRIES = 20;

const tasteEntrySchema = z.string().trim().min(1).max(TASTE_ENTRY_MAX_LENGTH);
const tasteListSchema = z.array(tasteEntrySchema).max(TASTE_LIST_MAX_ENTRIES);

/** Every field optional — a first-time user has no saved Taste Memory at all, and that
 * must remain a perfectly valid request (see Milestone 7, Step 15). Never trusts the
 * client: malformed entries (wrong type, too long, too many) fail validation the same
 * way the rest of this request does. */
const tastePreferencesSchema = z
  .object({
    favoriteComfortFoods: tasteListSchema.optional(),
    likedIngredients: tasteListSchema.optional(),
    dislikedIngredients: tasteListSchema.optional(),
    dietaryPreferences: tasteListSchema.optional(),
  })
  .optional();

/**
 * Runtime validation for the incoming Vibe Check request body. Mirrors the frontend's
 * own submission rules (see client/src/hooks/useVibeCheck.ts's `canSubmit`): at least one
 * of mood / non-whitespace text / a quick pick must be present, never trust the client to
 * have actually enforced that itself.
 *
 * `tastePreferences` is always normalized to a fully-populated object (missing lists
 * default to `[]`) so downstream code (prompt.ts) never has to null-check it — it only
 * has to check whether each list is empty when deciding what to include in the prompt.
 */
export const vibeCheckRequestSchema = z
  .object({
    selectedMood: z.enum(MOODS as [Mood, ...Mood[]]).nullable().optional(),
    userText: z.string().max(VIBE_CHECK_TEXT_LIMIT).optional(),
    quickInputs: z.array(z.enum(QUICK_INPUTS)).max(QUICK_INPUTS.length).optional(),
    tastePreferences: tastePreferencesSchema,
  })
  .transform((data) => ({
    selectedMood: data.selectedMood ?? null,
    userText: (data.userText ?? "").trim(),
    quickInputs: data.quickInputs ?? [],
    tastePreferences: {
      favoriteComfortFoods: data.tastePreferences?.favoriteComfortFoods ?? [],
      likedIngredients: data.tastePreferences?.likedIngredients ?? [],
      dislikedIngredients: data.tastePreferences?.dislikedIngredients ?? [],
      dietaryPreferences: data.tastePreferences?.dietaryPreferences ?? [],
    },
  }))
  .refine(
    (data) => data.selectedMood !== null || data.userText.length > 0 || data.quickInputs.length > 0,
    { message: "Provide at least a mood, a message, or a quick pick." },
  );

export type VibeCheckRequest = z.infer<typeof vibeCheckRequestSchema>;
