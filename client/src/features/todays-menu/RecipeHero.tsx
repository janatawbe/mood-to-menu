import type { ReactNode } from "react";
import { SparkleIcon } from "../../components/icons";
import { hexToRgba, type MoodTheme } from "../../lib/moodTheme";
import type { Recipe } from "../../types/domain";
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

/** The recipe hero: dish name is the visual star, everything else (mood/prep/effort/
 * style/tags) supports it. Uses `recipe.detectedMood` (not the Vibe Check's own
 * `selectedMood`, which may be null if the user only typed text) since Gemini always
 * returns one — this screen always has a mood to theme itself around. */
export function RecipeHero({ recipe, theme }: RecipeHeroProps) {
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
        <MetaPill>{recipe.mealIntent.style}</MetaPill>
      </div>

      {recipe.tags.length > 0 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-accent-soft/70 px-3 py-1 text-xs font-semibold text-brand-accent-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
