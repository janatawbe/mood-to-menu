// Groups Recipe History entries into Today/Yesterday/Earlier and formats timestamps.
export type RelativeDayGroup = "Today" | "Yesterday" | "Earlier";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Deterministic calendar-day grouping — no date library, just local Date math comparing
 * calendar-day boundaries (not a raw 24-hour window), so "yesterday at 11pm" and "today
 * at 1am" group correctly even though they're less than a day apart.
 */
export function relativeDayGroup(iso: string, now: Date = new Date()): RelativeDayGroup {
  const diffDays = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

const GROUP_ORDER: RelativeDayGroup[] = ["Today", "Yesterday", "Earlier"];

export interface DayGroup<T> {
  label: RelativeDayGroup;
  entries: T[];
}

/** Groups already-sorted entries (newest first) into Today/Yesterday/Earlier buckets in
 * that fixed order, preserving each bucket's relative order, and omitting empty buckets
 * — mirrors groceryCategories.ts's `groupGroceryItems` shape/spirit for Recipe History. */
export function groupByRelativeDay<T>(entries: T[], getIso: (entry: T) => string, now: Date = new Date()): DayGroup<T>[] {
  const buckets: Record<RelativeDayGroup, T[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const entry of entries) {
    buckets[relativeDayGroup(getIso(entry), now)].push(entry);
  }
  return GROUP_ORDER.map((label) => ({ label, entries: buckets[label] })).filter((group) => group.entries.length > 0);
}

/** A short, friendly per-card timestamp: just the time for today, otherwise a short
 * month/day (and year, if not the current one). */
export function formatSavedTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  if (relativeDayGroup(iso, now) === "Today") {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === now.getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
}
