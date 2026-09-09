import { Button } from "../../components/Button";
import type { PublicRecipe } from "../../types/domain";
import { MoodBadge } from "../todays-menu/MoodBadge";

interface PublicRecipeCardProps {
  recipe: PublicRecipe;
  onOpen: () => void;
}

/**
 * A "Recently Generated" summary card — deliberately lighter than Favorites'
 * `FavoriteRecipeCard` (no remove control, just up to 3 tags and an Open Recipe button)
 * so the gallery reads as a light browse, not a personal collection.
 */
export function PublicRecipeCard({ recipe, onOpen }: PublicRecipeCardProps) {
  const previewTags = recipe.tags.slice(0, 3);

  return (
    <div className="flex flex-col gap-3 rounded-4xl border border-tan-200/60 bg-cream-soft p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-brand-accent-strong uppercase">Recently generated</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink">{recipe.dishName}</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MoodBadge mood={recipe.detectedMood} size="sm" />
        <span className="rounded-full border border-tan-200 bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
          {recipe.prepTime}
        </span>
      </div>

      {previewTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {previewTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-tan-200 bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Button variant="secondary" size="sm" onClick={onOpen} className="mt-1 self-start">
        Open Recipe
      </Button>
    </div>
  );
}
