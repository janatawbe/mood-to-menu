import { ChefHatIcon } from "../../components/icons";
import { hexToRgba, type MoodTheme } from "../../lib/moodTheme";

interface ReasoningPanelProps {
  reasoning: string;
  theme: MoodTheme;
}

/** A dedicated, clearly-contained note for Gemini's reasoning — the real
 * backend-generated copy, unedited, never a floating unstyled paragraph. */
export function ReasoningPanel({ reasoning, theme }: ReasoningPanelProps) {
  return (
    <section
      aria-labelledby="why-this-matches-heading"
      className="rounded-3xl border p-4 sm:p-5"
      style={{ borderColor: hexToRgba(theme.accent, 0.35), backgroundColor: theme.cardBackground }}
    >
      <h2 id="why-this-matches-heading" className="flex items-center gap-2 font-display text-base font-bold text-ink">
        <ChefHatIcon width={18} height={18} style={{ color: theme.accentStrong }} />
        Why this matches your mood
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">{reasoning}</p>
    </section>
  );
}
