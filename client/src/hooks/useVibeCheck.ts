import { useCallback, useMemo, useState } from "react";
import { generateRecipe, RecipeApiError } from "../services/api";
import type { Mood, Recipe, VibeCheck } from "../types/domain";

export type VibeCheckPhase = "idle" | "loading" | "captured" | "error";

export const VIBE_CHECK_TEXT_LIMIT = 200;

export interface VibeCheckError {
  code: string;
  message: string;
}

function toVibeCheckError(err: unknown): VibeCheckError {
  return err instanceof RecipeApiError
    ? { code: err.code, message: err.message }
    : { code: "INTERNAL_ERROR", message: "Something went wrong in the kitchen. Please try again." };
}

/**
 * Owns the Vibe Check's interaction state — mood selection, free text, quick-input
 * chips, the submit/loading/captured/error phase, and the current recipe — so it can be
 * lifted to a common ancestor (AppShell) and shared between the Vibe Check card, the
 * Today's Menu screen, and the sidebar's chef, without reaching for a full
 * state-management library.
 *
 * `submit`/`retry` call the real POST /api/recipes/generate endpoint (see
 * ../services/api.ts) — loading starts when the request goes out and ends only when a
 * valid recipe arrives or the request fails. `onGenerated` fires once, right after a
 * successful *initial* generation (i.e. from the Vibe Check form, not a Today's Menu
 * regeneration) — AppShell uses it to switch the active nav section to Today's Menu.
 *
 * `regenerate` is a separate action (Milestone 5, driven from Today's Menu) with its own
 * `isRegenerating`/`regenerateError` state, deliberately kept apart from `phase`/`error`
 * so a failed regeneration never destroys or hides the recipe currently on screen.
 */
export function useVibeCheck(onGenerated?: () => void) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userText, setUserTextRaw] = useState("");
  const [quickInputs, setQuickInputs] = useState<string[]>([]);
  const [phase, setPhase] = useState<VibeCheckPhase>("idle");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<VibeCheckError | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<VibeCheckError | null>(null);

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
  const hasSignal = selectedMood !== null || hasMeaningfulText || quickInputs.length > 0;
  // "captured" is included so editing/resubmitting an already-answered Vibe Check works
  // the same way as the first submission (the card shows the same editable form for
  // both — see VibeCheckInputCard).
  const canSubmit = (phase === "idle" || phase === "captured") && hasSignal;
  const canRetry = phase === "error" && hasSignal;
  const canRegenerate = hasSignal && !isRegenerating;

  const runGeneration = useCallback(async () => {
    setError(null);
    setPhase("loading");
    try {
      const result = await generateRecipe({ selectedMood, userText, quickInputs });
      setRecipe(result);
      setPhase("captured");
      onGenerated?.();
    } catch (err) {
      setError(toVibeCheckError(err));
      setPhase("error");
    }
  }, [selectedMood, userText, quickInputs, onGenerated]);

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

  /** Re-generates from Today's Menu using the same Vibe Check signals. Never touches
   * `phase`/`error` (the initial-generation state machine) — the currently displayed
   * recipe stays in place until a new one arrives, and stays in place (with a localized
   * `regenerateError` instead) if the request fails. */
  const regenerate = useCallback(async () => {
    if (!canRegenerate) return;
    setRegenerateError(null);
    setIsRegenerating(true);
    try {
      const result = await generateRecipe({ selectedMood, userText, quickInputs });
      setRecipe(result);
    } catch (err) {
      setRegenerateError(toVibeCheckError(err));
    } finally {
      setIsRegenerating(false);
    }
  }, [canRegenerate, selectedMood, userText, quickInputs]);

  /** Returns to the editable form after a failed *initial* generation — mood/text/chips
   * and any previously generated recipe are left untouched, this only clears the error
   * and the failed phase. */
  const editVibeCheck = useCallback(() => {
    setPhase("idle");
    setError(null);
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
    isRegenerating,
    regenerateError,
    hasMeaningfulText,
    canSubmit,
    canRetry,
    canRegenerate,
    toggleMood,
    setUserText,
    toggleQuickInput,
    submit,
    retry,
    regenerate,
    editVibeCheck,
  };
}

export type UseVibeCheckReturn = ReturnType<typeof useVibeCheck>;
