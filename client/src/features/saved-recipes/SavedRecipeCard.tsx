import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { IconButton } from "../../components/IconButton";
import { CloseIcon } from "../../components/icons";
import type { Recipe } from "../../types/domain";
import { MoodBadge } from "../todays-menu/MoodBadge";

const effortLabel: Record<Recipe["mealIntent"]["prepEffort"], string> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

interface SavedRecipeCardProps {
  recipe: Recipe;
  /** Pre-formatted by the parent screen (see ../../lib/dateGroups) — Favorites shows a
   * plain "saved" timestamp; History groups by day and shows a plain time within each
   * group, so the exact formatting differs slightly per screen. */
  timestampLabel: string;
  onOpen: () => void;
  onRemove: () => void;
  removeLabel: string;
}

/**
 * A compact, scannable card shared by Favorites and Recipe History (Milestone 8, Step
 * 11/15) — enough to recognize the recipe at a glance, never the full ingredients/
 * instructions (that's what "Open recipe" is for).
 */
export function SavedRecipeCard({ recipe, timestampLabel, onOpen, onRemove, removeLabel }: SavedRecipeCardProps) {
  return (
    <Card tone="surface" className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-bold text-ink">{recipe.dishName}</h3>
          {timestampLabel && <p className="text-xs text-ink-muted">{timestampLabel}</p>}
        </div>
        <IconButton
          icon={<CloseIcon width={13} height={13} />}
          label={removeLabel}
          onClick={onRemove}
          className="h-8 w-8 shrink-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <MoodBadge mood={recipe.detectedMood} />
        <span className="rounded-full border border-tan-200 bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink-soft">
          {recipe.prepTime}
        </span>
        <span className="rounded-full border border-tan-200 bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink-soft">
          {effortLabel[recipe.mealIntent.prepEffort]}
        </span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-accent-soft/70 px-2.5 py-0.5 text-[11px] font-semibold text-brand-accent-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Button variant="secondary" size="sm" onClick={onOpen} className="mt-1 self-start">
        Open recipe
      </Button>
    </Card>
  );
}
