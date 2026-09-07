import { describe, expect, it } from "vitest";
import { formatSavedTimestamp, groupByRelativeDay, relativeDayGroup } from "./dateGroups";

const now = new Date(2026, 5, 15, 14, 30, 0);

function iso(year: number, month: number, day: number, hour = 12): string {
  return new Date(year, month, day, hour).toISOString();
}

describe("relativeDayGroup", () => {
  it("groups a timestamp from earlier today as 'Today'", () => {
    expect(relativeDayGroup(iso(2026, 5, 15, 1), now)).toBe("Today");
  });

  it("groups a timestamp from the previous calendar day as 'Yesterday'", () => {
    expect(relativeDayGroup(iso(2026, 5, 14, 23), now)).toBe("Yesterday");
  });

  it("groups a timestamp from two or more days ago as 'Earlier'", () => {
    expect(relativeDayGroup(iso(2026, 5, 10), now)).toBe("Earlier");
  });

  it("uses calendar-day boundaries, not a rolling 24-hour window", () => {
    // Yesterday at 11pm is less than 24 hours before today at 1am, but it's still a
    // different calendar day, so it must group as "Yesterday", not "Today".
    expect(relativeDayGroup(iso(2026, 5, 14, 23), new Date(2026, 5, 15, 1))).toBe("Yesterday");
  });
});

describe("groupByRelativeDay", () => {
  it("buckets entries into Today/Yesterday/Earlier in that order, omitting empty buckets", () => {
    const entries = [
      { id: "a", when: iso(2026, 5, 15, 9) },
      { id: "b", when: iso(2026, 5, 14, 9) },
      { id: "c", when: iso(2026, 5, 1, 9) },
    ];
    const groups = groupByRelativeDay(entries, (e) => e.when, now);

    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday", "Earlier"]);
    expect(groups[0]?.entries.map((e) => e.id)).toEqual(["a"]);
  });

  it("omits a bucket entirely when it has no entries", () => {
    const entries = [{ id: "a", when: iso(2026, 5, 15, 9) }];
    const groups = groupByRelativeDay(entries, (e) => e.when, now);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Today");
  });

  it("preserves each bucket's relative order", () => {
    const entries = [
      { id: "newest", when: iso(2026, 5, 15, 20) },
      { id: "older", when: iso(2026, 5, 15, 8) },
    ];
    const groups = groupByRelativeDay(entries, (e) => e.when, now);

    expect(groups[0]?.entries.map((e) => e.id)).toEqual(["newest", "older"]);
  });
});

describe("formatSavedTimestamp", () => {
  it("returns a time-only string for a timestamp from today", () => {
    const result = formatSavedTimestamp(iso(2026, 5, 15, 9), now);
    expect(result).not.toMatch(/2026/);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a month/day string for a past date in the current year", () => {
    const result = formatSavedTimestamp(iso(2026, 0, 3), now);
    expect(result).toMatch(/jan/i);
    expect(result).not.toMatch(/2026/);
  });

  it("includes the year for a date in a different year", () => {
    const result = formatSavedTimestamp(iso(2024, 0, 3), now);
    expect(result).toMatch(/2024/);
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatSavedTimestamp("not-a-date", now)).toBe("");
  });
});
