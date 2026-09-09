import { ArrowLeftIcon } from "../../components/icons";
import type { UseGroceryListReturn } from "../../hooks/useGroceryList";
import type { UsePublicFavoritesReturn } from "../../hooks/usePublicFavorites";
import type { PublicRecipe, RecipeIngredient } from "../../types/domain";
import { ChefTipCard } from "../todays-menu/ChefTipCard";
import { IngredientsList } from "../todays-menu/IngredientsList";
import { InstructionsList } from "../todays-menu/InstructionsList";
import { NutritionCard } from "../todays-menu/NutritionCard";
import { RecipeActions } from "../todays-menu/RecipeActions";
import { RecipeHero } from "../todays-menu/RecipeHero";

interface PublicRecipeDetailProps {
  recipe: PublicRecipe;
  onBack: () => void;
  groceryList: UseGroceryListReturn;
  publicFavorites: UsePublicFavoritesReturn;
}

/**
 * The full "Open Recipe" view for a public recipe — reuses Today's Menu's own
 * presentational pieces (hero, actions, ingredients, instructions, nutrition, chef tip)
 * rather than duplicating that markup, but is deliberately NOT `RecipeReveal`: there is
 * no Reasoning panel (a public recipe never carries `reasoning`) and no Regenerate
 * (`RecipeActions` renders that button only when given an `onRegenerate`, which this view
 * never passes). Grocery List integration reuses `useGroceryList` completely unchanged
 * (it only needs `RecipeIngredient[]` + `{id, dishName}`, which `PublicRecipe` already
 * has). Favorites uses `usePublicFavorites` — a separate small store from the main
 * `useFavorites`, since a `PublicRecipe` (no `reasoning`) can never satisfy the `Recipe`
 * contract `FavoriteRecipe` requires; see `PublicFavoriteRecipe` in types/domain.ts. This
 * view never touches `useVibeCheck` or Gemini — it only ever renders data already
 * fetched from GET /api/public-recipes.
 */
export function PublicRecipeDetail({ recipe, onBack, groceryList, publicFavorites }: PublicRecipeDetailProps) {
  const sourceRecipe = { id: recipe.id, dishName: recipe.dishName };
  const isIngredientAdded = (ingredient: RecipeIngredient) => groceryList.isIngredientAdded(ingredient, recipe.id);
  const allIngredientsAdded = recipe.ingredients.every(isIngredientAdded);

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

      <RecipeActions
        allIngredientsAdded={allIngredientsAdded}
        onAddAllIngredients={() => groceryList.addIngredients(recipe.ingredients, sourceRecipe)}
        isFavorited={publicFavorites.isFavorited(recipe.id)}
        onToggleFavorite={() => publicFavorites.toggleFavorite(recipe)}
      />

      <IngredientsList
        ingredients={recipe.ingredients}
        isAdded={isIngredientAdded}
        onAdd={(ingredient) => groceryList.addIngredient(ingredient, sourceRecipe)}
      />
      <InstructionsList instructions={recipe.instructions} />
      <NutritionCard nutrition={recipe.nutrition} servings={recipe.servings} />
      <ChefTipCard chefTip={recipe.chefTip} />
    </div>
  );
}
