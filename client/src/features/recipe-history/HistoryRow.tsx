import { IconButton } from "../../components/IconButton";
import { CloseIcon } from "../../components/icons";
import type { Recipe } from "../../types/domain";
import { MoodBadge } from "../todays-menu/MoodBadge";

interface HistoryRowProps {
  recipe: Recipe;
  timeLabel: string;
  onOpen: () => void;
  onRemove: () => void;
  removeLabel: string;
}

/**
 * Recipe History's own row (Milestone 8 UI pass) — compact and list-like rather than a
 * card, so a long history scans quickly: the generated time sits in its own fixed-width
 * column on the left (a "timeline" cue), the dish name and mood stay on one line, and
 * "Open recipe" is a small text control rather than a full button, to keep the row's
 * height minimal. Several of these sit stacked with dividers between them (see
 * RecipeHistoryScreen), not spaced out in a grid like Favorites' cards.
 */
export function HistoryRow({ recipe, timeLabel, onOpen, onRemove, removeLabel }: HistoryRowProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-tan-100/50">
      <span className="w-14 shrink-0 text-xs font-semibold tabular-nums text-ink-muted">{timeLabel}</span>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className="mood-focus-ring rounded-lg text-left font-display text-base font-bold text-ink hover:text-brand-accent-strong"
        >
          <span className="line-clamp-1">{recipe.dishName}</span>
          <span className="sr-only"> — Open recipe</span>
        </button>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <MoodBadge mood={recipe.detectedMood} size="sm" />
          <span className="text-xs text-ink-muted">{recipe.prepTime}</span>
        </div>
      </div>

      <IconButton icon={<CloseIcon width={13} height={13} />} label={removeLabel} onClick={onRemove} className="h-8 w-8 shrink-0" />
    </div>
  );
}
