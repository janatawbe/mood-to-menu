import { useCallback, useMemo, useState } from "react";
import { generateRecipe, RecipeApiError } from "../services/api";
import type { Mood, Recipe, VibeCheck } from "../types/domain";

export type VibeCheckPhase = "idle" | "loading" | "captured" | "error";

export const VIBE_CHECK_TEXT_LIMIT = 200;

export interface VibeCheckError {
  code: string;
  message: string;
}

/**
 * Owns the Vibe Check's interaction state — mood selection, free text, quick-input
 * chips, and the submit/loading/captured/error phase — so it can be lifted to a common
 * ancestor (AppShell) and shared between the Vibe Check card and the sidebar's chef,
 * without reaching for a full state-management library.
 *
 * Milestone 4: `submit`/`retry` now call the real POST /api/recipes/generate endpoint
 * (see ../services/api.ts) instead of a fake timer — loading starts when the request
 * goes out and ends only when a valid recipe arrives or the request fails.
 */
export function useVibeCheck() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userText, setUserTextRaw] = useState("");
  const [quickInputs, setQuickInputs] = useState<string[]>([]);
  const [phase, setPhase] = useState<VibeCheckPhase>("idle");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<VibeCheckError | null>(null);

  const toggleMood = useCallback((mood: Mood) => {
    setSelectedMood((current) => (current === mood ? null : mood));
  }, []);

  const setUserText = useCallback((text: string) => {
    setUserTextRaw(text.slice(0, VIBE_CHECK_TEXT_LIMIT));
  }, []);

  const toggleQuickInput = useCallback((chip: string) => {
    setQuickInputs((current) =>
      current.includes(chip) ? current.filter((entry) => entry !== chip) : [...current, chip],
    );
  }, []);

  const hasMeaningfulText = userText.trim().length > 0;
  const canSubmit =
    phase === "idle" && (selectedMood !== null || hasMeaningfulText || quickInputs.length > 0);
  const canRetry =
    phase === "error" && (selectedMood !== null || hasMeaningfulText || quickInputs.length > 0);

  const runGeneration = useCallback(async () => {
    setError(null);
    setPhase("loading");
    try {
      const result = await generateRecipe({ selectedMood, userText, quickInputs });
      setRecipe(result);
      setPhase("captured");
    } catch (err) {
      const apiError =
        err instanceof RecipeApiError
          ? { code: err.code, message: err.message }
          : { code: "INTERNAL_ERROR", message: "Something went wrong in the kitchen. Please try again." };
      setError(apiError);
      setPhase("error");
    }
  }, [selectedMood, userText, quickInputs]);

  const submit = useCallback(() => {
    if (!canSubmit) return;
    void runGeneration();
  }, [canSubmit, runGeneration]);

  /** Retries the same submission after a failure — mood/text/chips are already intact
   * since they live in their own state, untouched by the failed request. */
  const retry = useCallback(() => {
    if (!canRetry) return;
    void runGeneration();
  }, [canRetry, runGeneration]);

  /** Returns to the editable form with everything the user already entered intact —
   * this is a "go back and adjust," not a reset. */
  const editVibeCheck = useCallback(() => {
    setPhase("idle");
    setError(null);
    setRecipe(null);
  }, []);

  const vibeCheck: VibeCheck = useMemo(
    () => ({ selectedMood, userText, quickInputs }),
    [selectedMood, userText, quickInputs],
  );

  return {
    vibeCheck,
    selectedMood,
    userText,
    quickInputs,
    phase,
    recipe,
    error,
    hasMeaningfulText,
    canSubmit,
    canRetry,
    toggleMood,
    setUserText,
    toggleQuickInput,
    submit,
    retry,
    editVibeCheck,
  };
}

export type UseVibeCheckReturn = ReturnType<typeof useVibeCheck>;
