import { CheckIcon, PlusIcon } from "../../components/icons";
import type { RecipeIngredient } from "../../types/domain";

interface IngredientsListProps {
  ingredients: RecipeIngredient[];
  isAdded: (ingredient: RecipeIngredient) => boolean;
  onAdd: (ingredient: RecipeIngredient) => void;
}

/** Two-column on wider screens, single column on narrow ones — supports any realistic
 * ingredient count (5 to 12+) without the layout breaking. Each row also gets a
 * compact, keyboard-accessible add-to-grocery-list affordance (Milestone 6, Step 7) —
 * a single small button, not a cluttered row of controls. */
export function IngredientsList({ ingredients, isAdded, onAdd }: IngredientsListProps) {
  return (
    <section aria-labelledby="ingredients-heading">
      <h2 id="ingredients-heading" className="font-display text-base font-bold text-ink">
        Ingredients
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {ingredients.map((ingredient, index) => {
          const added = isAdded(ingredient);
          return (
            <li
              key={`${ingredient.name}-${index}`}
              className="flex items-baseline gap-2 border-b border-dashed border-tan-200/80 py-1.5 text-sm"
            >
              <span aria-hidden className="mb-0.5 h-1.5 w-1.5 shrink-0 self-center rounded-full bg-brand-accent" />
              <span className="font-semibold text-ink">{ingredient.amount}</span>
              <span className="flex-1 text-ink-soft">{ingredient.name}</span>
              <button
                type="button"
                onClick={() => onAdd(ingredient)}
                disabled={added}
                aria-label={added ? `${ingredient.name} is on your grocery list` : `Add ${ingredient.name} to grocery list`}
                aria-pressed={added}
                title={added ? "On your grocery list" : "Add to grocery list"}
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full transition-colors duration-150 ${
                  added
                    ? "bg-brand-accent-soft text-brand-accent-strong"
                    : "text-ink-muted hover:bg-tan-100 hover:text-brand-accent-strong disabled:cursor-not-allowed"
                }`}
              >
                {added ? <CheckIcon width={12} height={12} /> : <PlusIcon width={12} height={12} />}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
