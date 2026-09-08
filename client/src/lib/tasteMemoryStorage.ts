// Taste Memory localStorage persistence: load/save with per-entry validation.
import { z } from "zod";
import type { TastePreferences } from "../types/domain";

/** Versioned so a future incompatible shape change can migrate or start fresh instead of
 * silently misreading old data — same convention as GROCERY_STORAGE_KEY. */
export const TASTE_MEMORY_STORAGE_KEY = "mood-to-menu:taste-memory:v1";

/** Mirrors server/src/schemas/vibeCheck.ts's taste-preference limits — kept in sync by
 * hand, the same way the domain types already are. */
export const TASTE_ENTRY_MAX_LENGTH = 40;
export const TASTE_LIST_MAX_ENTRIES = 20;

const tasteEntrySchema = z.string().trim().min(1).max(TASTE_ENTRY_MAX_LENGTH);

export function emptyTasteMemory(): TastePreferences {
  return { favoriteComfortFoods: [], likedIngredients: [], dislikedIngredients: [], dietaryPreferences: [] };
}

/** Case/whitespace-insensitive comparison key — used for both duplicate detection and
 * malformed-storage cleanup, never for what's actually displayed/saved (that keeps its
 * original trimmed casing). */
function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Validates one raw list value entry-by-entry (like groceryStorage's per-item
 * filtering) rather than discarding the whole list if one entry is malformed — a single
 * corrupted string shouldn't erase an otherwise-valid saved list. Also re-applies the
 * same dedupe/cap rules used when adding, in case storage was hand-edited or an older
 * version wrote something no longer valid. */
function sanitizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    const parsed = tasteEntrySchema.safeParse(entry);
    if (!parsed.success) continue;
    const key = normalizeKey(parsed.data);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(parsed.data);
    if (result.length >= TASTE_LIST_MAX_ENTRIES) break;
  }
  return result;
}

/**
 * Reads and validates the persisted Taste Memory. Treats localStorage as untrusted
 * input end to end: missing storage, disabled storage, invalid JSON, a non-object
 * value, and individually malformed list entries are all handled without throwing —
 * malformed entries are dropped individually (per field) rather than discarding the
 * whole preference set, so one bad row can't erase everything else the user saved.
 */
export function loadTasteMemory(): TastePreferences {
  const empty = emptyTasteMemory();
  if (typeof window === "undefined") return empty;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(TASTE_MEMORY_STORAGE_KEY);
  } catch {
    return empty;
  }
  if (!raw) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }
  if (typeof parsed !== "object" || parsed === null) return empty;
  const obj = parsed as Record<string, unknown>;

  return {
    favoriteComfortFoods: sanitizeList(obj.favoriteComfortFoods),
    likedIngredients: sanitizeList(obj.likedIngredients),
    dislikedIngredients: sanitizeList(obj.dislikedIngredients),
    dietaryPreferences: sanitizeList(obj.dietaryPreferences),
  };
}

/** Never throws — a full storage quota or a browser blocking storage (private mode)
 * simply means this change won't survive a refresh, not a crashed app. */
export function saveTasteMemory(preferences: TastePreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TASTE_MEMORY_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Intentionally swallowed — see doc comment above.
  }
}
