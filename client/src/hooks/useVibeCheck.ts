import { useCallback, useMemo, useState } from "react";
import { generateRecipe, RecipeApiError } from "../services/api";
import type { Mood, Recipe, TastePreferences, VibeCheck } from "../types/domain";

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

// Owns Vibe Check's interaction state (mood, text, quick chips, phase, recipe) so it can
// be shared between the Vibe Check card, Today's Menu, and the sidebar chef via one hook.
//
// `onGenerated` fires only after a successful *initial* generation, not a regenerate —
// AppShell uses it to switch the active nav section to Today's Menu. `regenerate` keeps
// its own `isRegenerating`/`regenerateError` state so a failed regeneration never hides
// the recipe already on screen. `tastePreferences` is read fresh via closure on every
// call, so a Taste Memory edit applies to the very next generation with no refresh.
// `onRecipeGenerated` is called imperatively at the point a response is validated (not
// from an effect watching `recipe`), so a React StrictMode double-render can't record a
// duplicate Recipe History entry.
export function useVibeCheck(
  onGenerated?: () => void,
  tastePreferences?: TastePreferences,
  onRecipeGenerated?: (recipe: Recipe) => void,
) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userText, setUserTextRaw] = useState("");
  const [quickInputs, setQuickInputs] = useState<string[]>([]);
  const [phase, setPhase] = useState<VibeCheckPhase>("idle");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<VibeCheckError | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<VibeCheckError | null>(null);
  // True when the on-screen recipe came from Favorites/History rather than the current
  // Vibe Check inputs — disables regeneration (see `canRegenerate`) rather than silently
  // regenerating against unrelated state.
  const [isReopenedRecipe, setIsReopenedRecipe] = useState(false);

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
  const canRegenerate = hasSignal && !isRegenerating && !isReopenedRecipe;

  const runGeneration = useCallback(async () => {
    setError(null);
    setPhase("loading");
    try {
      const result = await generateRecipe({ selectedMood, userText, quickInputs, tastePreferences });
      setRecipe(result);
      setPhase("captured");
      setIsReopenedRecipe(false);
      onGenerated?.();
      onRecipeGenerated?.(result);
    } catch (err) {
      setError(toVibeCheckError(err));
      setPhase("error");
    }
  }, [selectedMood, userText, quickInputs, tastePreferences, onGenerated, onRecipeGenerated]);

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
   * `regenerateError` instead) if the request fails. Disabled entirely (see
   * `canRegenerate`) while viewing a reopened Favorite/History recipe. */
  const regenerate = useCallback(async () => {
    if (!canRegenerate) return;
    setRegenerateError(null);
    setIsRegenerating(true);
    try {
      const result = await generateRecipe({ selectedMood, userText, quickInputs, tastePreferences });
      setRecipe(result);
      setIsReopenedRecipe(false);
      onRecipeGenerated?.(result);
    } catch (err) {
      setRegenerateError(toVibeCheckError(err));
    } finally {
      setIsRegenerating(false);
    }
  }, [canRegenerate, selectedMood, userText, quickInputs, tastePreferences, onRecipeGenerated]);

  /** Returns to the editable form after a failed *initial* generation — mood/text/chips
   * and any previously generated recipe are left untouched, this only clears the error
   * and the failed phase. */
  const editVibeCheck = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  /** Opens an already-validated Recipe from Favorites/History — no Gemini call, just
   * displays it via the same Today's Menu path as a live generation. Marks it reopened
   * so Regenerate stays disabled until a real generation replaces it. */
  const openRecipe = useCallback((savedRecipe: Recipe) => {
    setError(null);
    setRegenerateError(null);
    setRecipe(savedRecipe);
    setPhase("captured");
    setIsReopenedRecipe(true);
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
    isReopenedRecipe,
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
    openRecipe,
  };
}

export type UseVibeCheckReturn = ReturnType<typeof useVibeCheck>;
