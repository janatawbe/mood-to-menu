import type { Mood } from "../../types/domain";

export interface MoodPreviewEntry {
  mood: Mood;
  label: string;
  /** Tint for the soft glow rendered behind the character. */
  glow: string;
}

export const moodPreviewEntries: MoodPreviewEntry[] = [
  { mood: "calm", label: "Calm", glow: "#C9B8ED" },
  { mood: "stressed", label: "Stressed", glow: "#A9CDEC" },
  { mood: "tired", label: "Tired", glow: "#B3A4C4" },
  { mood: "happy", label: "Happy", glow: "#FBD35A" },
  { mood: "energetic", label: "Energetic", glow: "#F4863A" },
  { mood: "cozy", label: "Cozy", glow: "#F3A96F" },
];
