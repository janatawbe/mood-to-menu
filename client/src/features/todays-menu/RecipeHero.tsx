import type { ReactNode } from "react";
import { SparkleIcon } from "../../components/icons";
import { hexToRgba, type MoodTheme } from "../../lib/moodTheme";
import type { Recipe } from "../../types/domain";
import { moodPreviewEntries } from "../shell/moodPreviewData";
import { MoodBadge } from "./MoodBadge";

interface RecipeHeroProps {
  recipe: Recipe;
  theme: MoodTheme;
}

const effortLabel: Record<Recipe["mealIntent"]["prepEffort"], string> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-tan-200 bg-cream-soft px-3.5 py-1.5 text-sm font-medium text-ink-soft">
      {children}
    </span>
  );
}

/**
 * Picks the one recipe tag worth showing next to mood/prep time/effort in the hero's
 * single metadata row — the first tag that doesn't just restate the mood, effort, or
 * meal style already shown there. Falls back to the meal style itself if every tag is
 * redundant (or there are no tags at all), so the row always has exactly 4 items.
 */
function pickHighlightTag(recipe: Recipe, moodLabel: string): string {
  const normalize = (value: string) => value.trim().toLowerCase();
  const redundant = new Set(
    [
      moodLabel,
      recipe.detectedMood,
      recipe.mealIntent.prepEffort,
      effortLabel[recipe.mealIntent.prepEffort],
      recipe.mealIntent.style,
    ].map(normalize),
  );

  const distinctTag = recipe.tags.find((tag) => !redundant.has(normalize(tag)));
  return distinctTag ?? recipe.mealIntent.style;
}

/** The recipe hero: dish name is the visual star, everything else (mood/prep/effort/
 * style/tags) supports it. Uses `recipe.detectedMood` (not the Vibe Check's own
 * `selectedMood`, which may be null if the user only typed text) since Gemini always
 * returns one — this screen always has a mood to theme itself around. */
export function RecipeHero({ recipe, theme }: RecipeHeroProps) {
  const moodLabel = moodPreviewEntries.find((entry) => entry.mood === recipe.detectedMood)?.label ?? recipe.detectedMood;
  const highlightTag = pickHighlightTag(recipe, moodLabel);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-10 h-56 rounded-full blur-3xl"
        style={{ backgroundColor: hexToRgba(theme.glow.primary, 0.35) }}
      />

      <div className="relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-accent-strong">
        <SparkleIcon width={14} height={14} />
        Today&apos;s Menu
      </div>
      <p className="relative mt-1 text-sm text-ink-muted">Made for your mood</p>
      <h1 className="relative mt-2 break-words font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
        {recipe.dishName}
      </h1>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <MoodBadge mood={recipe.detectedMood} />
        <MetaPill>{recipe.prepTime}</MetaPill>
        <MetaPill>{effortLabel[recipe.mealIntent.prepEffort]}</MetaPill>
        <MetaPill>{highlightTag}</MetaPill>
      </div>
    </div>
  );
}
