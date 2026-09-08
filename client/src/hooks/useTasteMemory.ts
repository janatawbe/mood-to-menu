import { useCallback, useEffect, useState } from "react";
import { loadTasteMemory, saveTasteMemory, TASTE_ENTRY_MAX_LENGTH, TASTE_LIST_MAX_ENTRIES } from "../lib/tasteMemoryStorage";
import type { TastePreferences } from "../types/domain";

export type TasteListKey = keyof TastePreferences;

/** Adding to one side of a like/dislike pair removes it from the other, so the same
 * normalized ingredient can never sit in both lists at once. Comfort foods and dietary
 * preferences don't conflict with anything. */
const CONFLICTING_LIST: Partial<Record<TasteListKey, TasteListKey>> = {
  likedIngredients: "dislikedIngredients",
  dislikedIngredients: "likedIngredients",
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Pure so it's easy to reason about/test: returns the next state, or `null` if the add
 * was rejected (empty/too long/duplicate/list already at capacity) — nothing to commit,
 * nothing changed. */
function computeAdd(current: TastePreferences, key: TasteListKey, raw: string): TastePreferences | null {
  const value = raw.trim();
  if (!value || value.length > TASTE_ENTRY_MAX_LENGTH) return null;

  const list = current[key];
  const normalized = normalize(value);
  if (list.some((entry) => normalize(entry) === normalized)) return null;
  if (list.length >= TASTE_LIST_MAX_ENTRIES) return null;

  const next: TastePreferences = { ...current, [key]: [...list, value] };
  const conflictKey = CONFLICTING_LIST[key];
  if (conflictKey) {
    next[conflictKey] = current[conflictKey].filter((entry) => normalize(entry) !== normalized);
  }
  return next;
}

function computeRemove(current: TastePreferences, key: TasteListKey, value: string): TastePreferences {
  const normalized = normalize(value);
  return { ...current, [key]: current[key].filter((entry) => normalize(entry) !== normalized) };
}

/**
 * Single source of truth for Taste Memory — instantiated once in AppShell and shared by
 * the Taste Memory screen (editing) and `useVibeCheck` (reading current preferences into
 * every generation), so an edit during the session applies to the very next generation
 * with no refresh needed.
 */
export function useTasteMemory() {
  const [preferences, setPreferences] = useState<TastePreferences>(() => loadTasteMemory());

  useEffect(() => {
    saveTasteMemory(preferences);
  }, [preferences]);

  /** Returns whether the entry was actually added (false if rejected as empty,
   * oversized, a duplicate, or the list is already at its cap). Reads `preferences`
   * directly (not via the functional setState form) so the return value reflects the
   * real outcome rather than guessing at React's internal eager-state behavior. */
  const addPreference = useCallback(
    (key: TasteListKey, value: string): boolean => {
      const next = computeAdd(preferences, key, value);
      if (!next) return false;
      setPreferences(next);
      return true;
    },
    [preferences],
  );

  const removePreference = useCallback((key: TasteListKey, value: string) => {
    setPreferences((current) => computeRemove(current, key, value));
  }, []);

  const isEmpty =
    preferences.favoriteComfortFoods.length === 0 &&
    preferences.likedIngredients.length === 0 &&
    preferences.dislikedIngredients.length === 0 &&
    preferences.dietaryPreferences.length === 0;

  return { preferences, isEmpty, addPreference, removePreference };
}

export type UseTasteMemoryReturn = ReturnType<typeof useTasteMemory>;
