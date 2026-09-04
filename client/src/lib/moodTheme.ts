import type { Mood } from "../types/domain";

/**
 * Central mood-atmosphere configuration for Milestone 3's "dynamic mood experience."
 *
 * Scope boundary (important): this file owns the *surrounding atmosphere* — ambient
 * background glow, the selected mood card's identity, and subtle accents on the input/
 * sidebar/chef. It deliberately does NOT own each mood character's own illustrated SVG
 * palette (the sparkle/cloud/Zzz/ray/spark/heart colors inside MoodCharacter.tsx) — those
 * are hand-tuned illustration detail, not atmosphere, and stay where they are.
 *
 * Any screen that needs "the current mood's colors" (Today's Menu, etc. in later
 * milestones) should import `getMoodTheme` from here rather than re-deriving colors.
 */
export interface MoodTheme {
  mood: Mood;
  /** Mid-strength accent — borders, rings, and glows tied to this mood. Not guaranteed
   * to pass text contrast on its own; see `accentStrong` for solid fills with white text. */
  accent: string;
  /** Darkened variant of `accent`, verified to clear 4.5:1 contrast with white text —
   * mirrors `--brand-accent-strong`'s role, for solid chip/button fills in this mood. */
  accentStrong: string;
  /** Lighter supporting tone — used in gradients and soft fills alongside `accent`. */
  accentSoft: string;
  /** Two-stop ambient glow used behind the whole app shell. */
  glow: { primary: string; secondary: string };
  /** Very light background wash for the selected mood card. */
  cardBackground: string;
  /** Full loop length (seconds) for this mood's ambient background drift — its
   * "animation personality," from Calm's near-stillness to Energetic's livelier pace. */
  driftSeconds: number;
}

/** The neutral Mood-to-Menu look, used whenever no mood is selected — this is the
 * existing Milestone 1 warm cream/orange atmosphere, unchanged, not one of the six. */
export const defaultTheme = {
  glow: { primary: "#FFCB9C", secondary: "#FFE3C6" },
} as const;

export const moodThemes: Record<Mood, MoodTheme> = {
  // Bright, airy, cool blue-violet — kept clearly higher-saturation and lighter than
  // Tired so the two never read as "the same purple."
  calm: {
    mood: "calm",
    accent: "#8E7CD9",
    accentStrong: "#7969B8",
    accentSoft: "#D6C6F5",
    // Both stops stay in the lavender/violet family — no more purple-on-the-left,
    // blue-on-the-right split.
    glow: { primary: "#C9B8ED", secondary: "#DED0F7" },
    cardBackground: "#F1ECFB",
    driftSeconds: 16,
  },
  stressed: {
    mood: "stressed",
    accent: "#6F93B8",
    accentStrong: "#597693",
    accentSoft: "#A9CDEC",
    glow: { primary: "#A9CDEC", secondary: "#D7E6F2" },
    cardBackground: "#EAF3FA",
    driftSeconds: 13,
  },
  // Deeper, dustier, warmer (mauve/plum-leaning) and noticeably less saturated than
  // Calm — a different hue family, not just a dimmer version of the same purple.
  tired: {
    mood: "tired",
    accent: "#8F7288",
    accentStrong: "#886C81",
    accentSoft: "#C2A8B8",
    glow: { primary: "#B89AAE", secondary: "#DCC9CE" },
    cardBackground: "#F0E6E6",
    driftSeconds: 18,
  },
  happy: {
    mood: "happy",
    accent: "#F5A623",
    accentStrong: "#9F6C17",
    accentSoft: "#FFD84D",
    glow: { primary: "#FBD35A", secondary: "#FFE9A8" },
    cardBackground: "#FFF8E1",
    driftSeconds: 8,
  },
  // Punchier, more saturated, golden-tangerine — pushed clearly away from Cozy's
  // softer coral-peach on the hue wheel, not just brighter.
  energetic: {
    mood: "energetic",
    accent: "#F5760A",
    accentStrong: "#B85908",
    accentSoft: "#FFAD5C",
    glow: { primary: "#F5813A", secondary: "#FFCB80" },
    cardBackground: "#FFF0E1",
    driftSeconds: 6,
  },
  // Softer, creamier, coral/peach-leaning and less saturated than Energetic.
  cozy: {
    mood: "cozy",
    accent: "#E0806F",
    accentStrong: "#A86053",
    accentSoft: "#F0A98A",
    glow: { primary: "#F3A96F", secondary: "#F0846B" },
    cardBackground: "#FDEEE0",
    driftSeconds: 11,
  },
};

export function getMoodTheme(mood: Mood | null): MoodTheme | null {
  return mood ? moodThemes[mood] : null;
}

/** `#RRGGBB` (or shorthand `#RGB`) → `rgba(r, g, b, alpha)`. Falls back to the input
 * unchanged if it isn't a hex color, so a bad value degrades instead of throwing. */
export function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(hex);
  const captured = match?.[1];
  if (!captured) return hex;
  let value = captured;
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The app-shell ambient wash: one broad top-left glow + one softer bottom-right glow,
 * matching the shape of the original Milestone 1 gradient so the default and mood washes
 * cross-fade into the same "light source" composition rather than a different layout. */
export function ambientWash(primary: string, secondary: string, primaryAlpha = 0.35, secondaryAlpha = 0.2) {
  return `radial-gradient(120% 90% at 15% 0%, ${hexToRgba(primary, primaryAlpha)} 0%, ${hexToRgba(primary, 0)} 55%), radial-gradient(90% 70% at 100% 100%, ${hexToRgba(secondary, secondaryAlpha)} 0%, ${hexToRgba(secondary, 0)} 60%)`;
}

/** Matches `--shadow-glow` in index.css but parameterized by mood accent, for the
 * selected mood card and other elements that should "glow" in the active mood's color. */
export function moodGlowShadow(accent: string, ringAlpha = 0.22, blurAlpha = 0.4) {
  return `0 0 0 4px ${hexToRgba(accent, ringAlpha)}, 0 12px 30px -12px ${hexToRgba(accent, blurAlpha)}`;
}

/** `#RRGGBB` darkened by `amount` (0-1) — e.g. for a button's hover/press state, so
 * every mood gets a consistent "one shade deeper" interaction color without hand-picking
 * a third hex per mood. */
export function darken(hex: string, amount: number): string {
  const match = /^#?([a-f\d]{6})$/i.exec(hex);
  const captured = match?.[1];
  if (!captured) return hex;
  const r = Math.round(parseInt(captured.slice(0, 2), 16) * (1 - amount));
  const g = Math.round(parseInt(captured.slice(2, 4), 16) * (1 - amount));
  const b = Math.round(parseInt(captured.slice(4, 6), 16) * (1 - amount));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
