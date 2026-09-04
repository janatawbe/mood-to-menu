import { useCallback, useEffect, useMemo, useState } from "react";
import type { Mood, VibeCheck } from "../types/domain";

export type VibeCheckPhase = "idle" | "loading" | "captured";

export const VIBE_CHECK_TEXT_LIMIT = 200;

/** How long the "chef is cooking" transition stays up before revealing the captured
 * summary. Frontend-only for Milestone 2 — no request is actually in flight. */
const LOADING_DURATION_MS = 1800;

/**
 * Owns the Vibe Check's interaction state — mood selection, free text, quick-input
 * chips, and the submit/loading/captured phase — so it can be lifted to a common
 * ancestor (AppShell) and shared between the Vibe Check card and the sidebar's chef,
 * without reaching for a full state-management library.
 */
export function useVibeCheck() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userText, setUserTextRaw] = useState("");
  const [quickInputs, setQuickInputs] = useState<string[]>([]);
  const [phase, setPhase] = useState<VibeCheckPhase>("idle");

  useEffect(() => {
    if (phase !== "loading") return;
    const timer = setTimeout(() => setPhase("captured"), LOADING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

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

  const submit = useCallback(() => {
    if (!canSubmit) return;
    setPhase("loading");
  }, [canSubmit]);

  /** Returns to the editable form with everything the user already entered intact —
   * this is a "go back and adjust," not a reset. */
  const editVibeCheck = useCallback(() => {
    setPhase("idle");
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
    hasMeaningfulText,
    canSubmit,
    toggleMood,
    setUserText,
    toggleQuickInput,
    submit,
    editVibeCheck,
  };
}

export type UseVibeCheckReturn = ReturnType<typeof useVibeCheck>;
