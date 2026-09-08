import type { Recipe, RecipeNutrition } from "../../types/domain";

interface NutritionCardProps {
  recipe: Recipe;
}

const NUTRITION_CELLS: Array<{ key: keyof RecipeNutrition; label: string; unit: string }> = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "carbohydratesG", label: "Carbs", unit: "g" },
  { key: "fatG", label: "Fat", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
];

/**
 * Nutritional Facts (Milestone 9) — AI-estimated, per serving, never lab-measured.
 * `recipe.nutrition` is optional (see types/domain.ts): a recipe saved to Favorites or
 * Recipe History before this milestone simply won't have it, and this section quietly
 * omits itself for that case rather than showing an empty/broken-looking block — no
 * Gemini call is ever made to backfill it for an old recipe.
 */
export function NutritionCard({ recipe }: NutritionCardProps) {
  const { nutrition, servings } = recipe;
  if (!nutrition) return null;

  return (
    <section
      aria-labelledby="nutrition-heading"
      className="rounded-3xl border border-tan-200 bg-cream-soft p-4 shadow-soft sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="nutrition-heading" className="font-display text-base font-bold text-ink">
          Nutritional Facts
        </h2>
        <p className="text-xs text-ink-muted">
          Approximate values per serving
          {servings ? ` · Makes ${servings} serving${servings === 1 ? "" : "s"}` : ""}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {NUTRITION_CELLS.map(({ key, label, unit }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-tan-200 bg-surface px-1.5 py-2.5 text-center sm:px-2"
          >
            <span className="font-display text-base font-bold text-brand-accent-strong sm:text-lg">
              {Math.round(nutrition[key])}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-ink-muted">{unit}</span>
            <span className="text-[11px] font-medium leading-tight text-ink-soft sm:text-xs">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
