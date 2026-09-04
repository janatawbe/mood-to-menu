import { z } from "zod";
import { MOODS, QUICK_INPUTS, type Mood } from "../types/domain.js";

export const VIBE_CHECK_TEXT_LIMIT = 200;

/**
 * Runtime validation for the incoming Vibe Check request body. Mirrors the frontend's
 * own submission rules (see client/src/hooks/useVibeCheck.ts's `canSubmit`): at least one
 * of mood / non-whitespace text / a quick pick must be present, never trust the client to
 * have actually enforced that itself.
 */
export const vibeCheckRequestSchema = z
  .object({
    selectedMood: z.enum(MOODS as [Mood, ...Mood[]]).nullable().optional(),
    userText: z.string().max(VIBE_CHECK_TEXT_LIMIT).optional(),
    quickInputs: z.array(z.enum(QUICK_INPUTS)).max(QUICK_INPUTS.length).optional(),
  })
  .transform((data) => ({
    selectedMood: data.selectedMood ?? null,
    userText: (data.userText ?? "").trim(),
    quickInputs: data.quickInputs ?? [],
  }))
  .refine(
    (data) => data.selectedMood !== null || data.userText.length > 0 || data.quickInputs.length > 0,
    { message: "Provide at least a mood, a message, or a quick pick." },
  );

export type VibeCheckRequest = z.infer<typeof vibeCheckRequestSchema>;
