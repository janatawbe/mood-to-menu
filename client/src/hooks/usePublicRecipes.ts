import { useCallback, useEffect, useState } from "react";
import { getRecentPublicRecipes, PublicRecipesApiError } from "../services/publicRecipesApi";
import type { PublicRecipe } from "../types/domain";

export type PublicRecipesStatus = "loading" | "success" | "error";

/**
 * Fetches the public "Recently Generated" feed once on mount. Entirely independent of
 * Vibe Check/Gemini generation — a failure here only ever affects this hook's own
 * `status`/`errorMessage`, never anything else in the app.
 */
export function usePublicRecipes() {
  const [status, setStatus] = useState<PublicRecipesStatus>("loading");
  const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only ever sets state from the promise's own callbacks, never synchronously in the
  // effect body itself — the initial "loading"/no-error state is already correct from
  // the `useState` defaults above, so there's nothing to reset before the first fetch.
  const fetchRecipes = useCallback(() => {
    getRecentPublicRecipes()
      .then((result) => {
        setRecipes(result);
        setStatus("success");
      })
      .catch((err: unknown) => {
        setErrorMessage(err instanceof PublicRecipesApiError ? err.message : "Couldn't load recently generated recipes right now.");
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Called from a user action (a "Try again" button), not an effect, so resetting state
  // synchronously here before re-fetching is fine.
  const refetch = useCallback(() => {
    setStatus("loading");
    setErrorMessage(null);
    fetchRecipes();
  }, [fetchRecipes]);

  return { status, recipes, errorMessage, refetch };
}

export type UsePublicRecipesReturn = ReturnType<typeof usePublicRecipes>;
