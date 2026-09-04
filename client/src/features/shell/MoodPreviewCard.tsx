import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { moodGlowShadow, moodThemes } from "../../lib/moodTheme";
import { MoodCharacter } from "./MoodCharacter";
import type { MoodPreviewEntry } from "./moodPreviewData";

interface MoodPreviewCardProps {
  entry: MoodPreviewEntry;
  selected: boolean;
  onSelect: () => void;
}

export function MoodPreviewCard({ entry, selected, onSelect }: MoodPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reacting = isHovered || selected;
  const theme = moodThemes[entry.mood];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-pressed={selected}
      aria-label={`${entry.label} mood`}
      className={`flex flex-col items-center gap-1 rounded-3xl border p-2.5 shadow-soft transition-[background-color,border-color,box-shadow] duration-200 sm:p-3 ${
        selected ? "" : "border-tan-200/70 bg-surface hover:border-brand-accent hover:shadow-glow"
      }`}
      style={
        selected
          ? {
              borderColor: theme.accent,
              backgroundColor: theme.cardBackground,
              boxShadow: moodGlowShadow(theme.accent, 0.2, 0.4),
            }
          : undefined
      }
      animate={prefersReducedMotion ? undefined : { y: selected ? -4 : 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <span className="relative flex h-24 w-20 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: theme.glow.primary }}
          aria-hidden
          animate={{ opacity: reacting ? 0.9 : 0.6, scale: reacting ? 1.12 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <MoodCharacter
          mood={entry.mood}
          reacting={reacting}
          className="relative drop-shadow-[0_6px_10px_rgba(59,42,32,0.16)]"
        />
      </span>
      <span className={`font-display text-sm font-bold ${selected ? "text-brand-accent-strong" : "text-ink"}`}>
        {entry.label}
      </span>
    </motion.button>
  );
}
