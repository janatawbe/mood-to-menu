import { Button } from "../../components/Button";
import { HeartIcon } from "../../components/icons";
import type { Recipe } from "../../types/domain";
import { MoodBadge } from "../todays-menu/MoodBadge";

const effortLabel: Record<Recipe["mealIntent"]["prepEffort"], string> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

interface FavoriteRecipeCardProps {
  recipe: Recipe;
  timestampLabel: string;
  onOpen: () => void;
  onRemove: () => void;
  removeLabel: string;
}

/**
 * Favorites' own recipe card (Milestone 8 UI pass) — deliberately larger and warmer than
 * Recipe History's compact row: a bigger dish name, more breathing room, and a solid
 * filled heart (rather than a plain X) as the remove affordance, since every card here
 * is already favorited by definition — the heart *is* the "remove from favorites"
 * control, making the favorited state visually the star of the card instead of an
 * incidental icon.
 */
export function FavoriteRecipeCard({ recipe, timestampLabel, onOpen, onRemove, removeLabel }: FavoriteRecipeCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-4xl border border-tan-200/60 bg-cream-soft p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-ink">{recipe.dishName}</h3>
          {timestampLabel && <p className="mt-0.5 text-xs font-medium text-brand-accent-strong">{timestampLabel}</p>}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          title={removeLabel}
          className="mood-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-brand-accent-strong transition-transform duration-200 hover:scale-110"
        >
          <HeartIcon width={22} height={22} fill="currentColor" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MoodBadge mood={recipe.detectedMood} />
        <span className="rounded-full border border-tan-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
          {recipe.prepTime}
        </span>
        <span className="rounded-full border border-tan-200 bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft">
          {effortLabel[recipe.mealIntent.prepEffort]}
        </span>
      </div>

      <Button variant="primary" size="sm" onClick={onOpen} className="mt-1 self-start">
        Open recipe
      </Button>
    </div>
  );
}
