import { ArrowLeftIcon } from "../../components/icons";
import type { PublicRecipe } from "../../types/domain";
import { ChefTipCard } from "../todays-menu/ChefTipCard";
import { IngredientsList } from "../todays-menu/IngredientsList";
import { InstructionsList } from "../todays-menu/InstructionsList";
import { NutritionCard } from "../todays-menu/NutritionCard";
import { RecipeHero } from "../todays-menu/RecipeHero";

interface PublicRecipeDetailProps {
  recipe: PublicRecipe;
  onBack: () => void;
}

/**
 * The full "Open Recipe" view for a public recipe — reuses Today's Menu's own
 * presentational pieces (hero, ingredients, instructions, nutrition, chef tip) rather
 * than duplicating that markup, but is deliberately NOT `RecipeReveal`: there is no
 * Reasoning panel (a public recipe never carries `reasoning`), no Regenerate/Favorite/
 * Add-all-to-grocery actions, and `IngredientsList` is rendered read-only (no
 * `isAdded`/`onAdd`). This view never touches `useVibeCheck`, `useGroceryList`,
 * `useFavorites`, or Gemini — it only ever renders data already fetched from
 * GET /api/public-recipes.
 */
export function PublicRecipeDetail({ recipe, onBack }: PublicRecipeDetailProps) {
  return (
    <div className="flex flex-col gap-5 pb-1">
      <button
        type="button"
        onClick={onBack}
        className="mood-focus-ring inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-ink-soft transition-colors hover:text-brand-accent-strong"
      >
        <ArrowLeftIcon width={16} height={16} />
        Back to Recently Generated
      </button>

      <RecipeHero recipe={recipe} eyebrowLabel="Recently Generated" subtitle="Shared by the community" />
      <IngredientsList ingredients={recipe.ingredients} />
      <InstructionsList instructions={recipe.instructions} />
      <NutritionCard nutrition={recipe.nutrition} servings={recipe.servings} />
      <ChefTipCard chefTip={recipe.chefTip} />
    </div>
  );
}
