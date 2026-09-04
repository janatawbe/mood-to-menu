import { Router } from "express";
import { vibeCheckRequestSchema } from "../schemas/vibeCheck.js";
import { generateRecipe } from "../services/gemini/recipeService.js";
import { RecipeServiceError } from "../services/gemini/errors.js";

export const recipesRouter = Router();

recipesRouter.post("/recipes/generate", async (req, res) => {
  const parsed = vibeCheckRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_REQUEST",
        message: "Let's fine-tune that — pick a mood, add a note, or choose a quick pick, then try again.",
      },
    });
    return;
  }

  try {
    const recipe = await generateRecipe(parsed.data);
    res.json({ recipe });
  } catch (err) {
    if (err instanceof RecipeServiceError) {
      res.status(err.httpStatus).json({ error: { code: err.code, message: err.message } });
      return;
    }
    // Truly unexpected (a bug, not a provider/validation failure) — never leak details.
    console.error("[recipes] unexpected error", err);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Something went wrong in the kitchen. Please try again." },
    });
  }
});
