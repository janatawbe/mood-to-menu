import { MoodCharacter } from "./MoodCharacter";
import type { MoodPreviewEntry } from "./moodPreviewData";

interface MoodPreviewCardProps {
  entry: MoodPreviewEntry;
}

export function MoodPreviewCard({ entry }: MoodPreviewCardProps) {
  return (
    <button
      type="button"
      className="group flex flex-col items-center gap-1 rounded-3xl border border-tan-200/70 bg-surface p-2.5 shadow-soft transition-all duration-200 hover:-translate-y-1.5 hover:border-brand-accent hover:shadow-glow focus-visible:-translate-y-1.5 sm:p-3"
      aria-label={`${entry.label} mood`}
    >
      <span className="relative flex h-24 w-20 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full opacity-60 blur-xl transition-opacity duration-200 group-hover:opacity-90"
          style={{ backgroundColor: entry.glow }}
          aria-hidden
        />
        <MoodCharacter
          mood={entry.mood}
          className="relative drop-shadow-[0_6px_10px_rgba(59,42,32,0.16)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110"
        />
      </span>
      <span className="font-display text-sm font-bold text-ink">{entry.label}</span>
    </button>
  );
}
