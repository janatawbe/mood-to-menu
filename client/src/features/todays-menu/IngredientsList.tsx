import type { RecipeIngredient } from "../../types/domain";

interface IngredientsListProps {
  ingredients: RecipeIngredient[];
}

/** Two-column on wider screens, single column on narrow ones — supports any realistic
 * ingredient count (5 to 12+) without the layout breaking. */
export function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <section aria-labelledby="ingredients-heading">
      <h2 id="ingredients-heading" className="font-display text-base font-bold text-ink">
        Ingredients
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {ingredients.map((ingredient, index) => (
          <li
            key={`${ingredient.name}-${index}`}
            className="flex items-baseline gap-2 border-b border-dashed border-tan-200/80 py-1.5 text-sm"
          >
            <span aria-hidden className="mb-0.5 h-1.5 w-1.5 shrink-0 self-center rounded-full bg-brand-accent" />
            <span className="font-semibold text-ink">{ingredient.amount}</span>
            <span className="text-ink-soft">{ingredient.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
