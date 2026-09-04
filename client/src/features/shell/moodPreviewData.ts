import type { Mood } from "../../types/domain";

export interface MoodPreviewEntry {
  mood: Mood;
  label: string;
}

// Per-mood colors (glow, accent, etc.) live in ../../lib/moodTheme — this file is just
// the label/ordering for the mood grid, to avoid two sources of truth for mood colors.
export const moodPreviewEntries: MoodPreviewEntry[] = [
  { mood: "calm", label: "Calm" },
  { mood: "stressed", label: "Stressed" },
  { mood: "tired", label: "Tired" },
  { mood: "happy", label: "Happy" },
  { mood: "energetic", label: "Energetic" },
  { mood: "cozy", label: "Cozy" },
];
