import { Button } from "../../components/Button";
import type { PublicRecipe } from "../../types/domain";
import { MoodBadge } from "../todays-menu/MoodBadge";

interface PublicRecipeCardProps {
  recipe: PublicRecipe;
  onOpen: () => void;
}

/**
 * A "Recently Generated" summary card — deliberately lighter than Favorites'
 * `FavoriteRecipeCard` (no remove control, just an Open Recipe button) so the gallery
 * reads as a light browse, not a personal collection.
 */
export function PublicRecipeCard({ recipe, onOpen }: PublicRecipeCardProps) {
  // Exactly 4 items on one row: mood, prep time, then the first two tags — never a 5th
  // item, and never a second row.
  const previewTags = recipe.tags.slice(0, 2);

  return (
    <div className="flex flex-col gap-3 rounded-4xl border border-tan-200/60 bg-cream-soft p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-accent-strong uppercase">Recently generated</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink">{recipe.dishName}</h3>
      </div>

      {/* `flex-nowrap` keeps all 4 pills on one row on desktop; on a narrow width where
          they genuinely don't fit, `overflow-x-auto` lets this row scroll horizontally on
          its own rather than wrapping a pill onto a second row or overflowing the card. */}
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        <span className="shrink-0">
          <MoodBadge mood={recipe.detectedMood} size="sm" />
        </span>
        <span className="shrink-0 rounded-full border border-tan-200 bg-surface px-2.5 py-1 text-xs font-medium whitespace-nowrap text-ink-soft">
          {recipe.prepTime}
        </span>
        {previewTags.map((tag) => (
          <span
            key={tag}
            className="shrink-0 rounded-full border border-tan-200 bg-surface px-2.5 py-1 text-xs font-medium whitespace-nowrap text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button variant="secondary" size="sm" onClick={onOpen} className="mt-1 self-start">
        Open Recipe
      </Button>
    </div>
  );
}
