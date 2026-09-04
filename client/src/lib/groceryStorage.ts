import { z } from "zod";
import type { GroceryItem } from "../types/domain";

/** Versioned so a future incompatible shape change can migrate or start fresh instead of
 * silently misreading old data. Bump to `v2` if the item shape ever changes. */
export const GROCERY_STORAGE_KEY = "mood-to-menu:grocery-list:v1";

const groceryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.string().min(1),
  checked: z.boolean(),
  sourceRecipe: z.object({
    id: z.string().min(1),
    dishName: z.string().min(1),
  }),
  addedAt: z.string().min(1),
});

/**
 * Reads and validates the persisted grocery list. Treats localStorage as untrusted
 * input end to end: missing storage, disabled storage, invalid JSON, a non-array value,
 * and individual malformed entries are all handled without throwing — malformed entries
 * are dropped individually rather than discarding the whole list, so one corrupted row
 * can't take out everything else the user saved.
 */
export function loadGroceryItems(): GroceryItem[] {
  if (typeof window === "undefined") return [];

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(GROCERY_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const items: GroceryItem[] = [];
  for (const entry of parsed) {
    const result = groceryItemSchema.safeParse(entry);
    if (result.success) items.push(result.data);
  }
  return items;
}

/** Never throws — a full storage quota or a browser blocking storage (private mode)
 * simply means this change won't survive a refresh, not a crashed app. */
export function saveGroceryItems(items: GroceryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Intentionally swallowed — see doc comment above.
  }
}
