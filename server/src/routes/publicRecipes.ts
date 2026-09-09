// GET /api/public-recipes — the latest publicly shared recipes, newest first.
import { Router } from "express";
import { publicRecipeStore } from "../services/publicRecipes/store.js";

export const publicRecipesRouter = Router();

publicRecipesRouter.get("/public-recipes", (_req, res) => {
  try {
    res.json({ recipes: publicRecipeStore.listRecent() });
  } catch (err) {
    // publicRecipeStore.listRecent() already swallows its own failures and returns [] —
    // this only guards against something truly unexpected (e.g. res.json itself).
    console.error("[public-recipes] unexpected error", err);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Couldn't load recently generated recipes right now." },
    });
  }
});
