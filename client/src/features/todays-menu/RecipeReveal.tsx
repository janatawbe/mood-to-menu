import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { VibeCheckError } from "../../hooks/useVibeCheck";
import { moodThemes } from "../../lib/moodTheme";
import type { Recipe } from "../../types/domain";
import { ChefTipCard } from "./ChefTipCard";
import { IngredientsList } from "./IngredientsList";
import { InstructionsList } from "./InstructionsList";
import { ReasoningPanel } from "./ReasoningPanel";
import { RecipeActions } from "./RecipeActions";
import { RecipeHero } from "./RecipeHero";

interface RecipeRevealProps {
  recipe: Recipe;
  isRegenerating: boolean;
  regenerateError: VibeCheckError | null;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
};

function RevealItem({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  return <motion.div variants={prefersReducedMotion ? reducedItemVariants : itemVariants}>{children}</motion.div>;
}

/**
 * The polished Today's Menu reveal: a soft mood-glow bloom + card scale-in, with each
 * section staggering into place a beat after the last (Milestone 5, Step 5). Keyed on
 * `recipe.id` so a Regenerate that swaps in a new recipe replays the same tasteful
 * sequence rather than jump-cutting to new content.
 */
export function RecipeReveal({ recipe, isRegenerating, regenerateError, canRegenerate, onRegenerate }: RecipeRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const theme = moodThemes[recipe.detectedMood];

  const containerVariants: Variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
    : {
        hidden: { opacity: 0, scale: 0.98, y: 8 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.07, delayChildren: 0.05 },
        },
      };

  return (
    <motion.div
      key={recipe.id}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-5 pb-1"
    >
      <RevealItem>
        <RecipeHero recipe={recipe} theme={theme} />
      </RevealItem>
      <RevealItem>
        <RecipeActions
          isRegenerating={isRegenerating}
          canRegenerate={canRegenerate}
          regenerateError={regenerateError}
          onRegenerate={onRegenerate}
        />
      </RevealItem>
      <RevealItem>
        <ReasoningPanel reasoning={recipe.reasoning} theme={theme} />
      </RevealItem>
      <RevealItem>
        <IngredientsList ingredients={recipe.ingredients} />
      </RevealItem>
      <RevealItem>
        <InstructionsList instructions={recipe.instructions} />
      </RevealItem>
      <RevealItem>
        <ChefTipCard chefTip={recipe.chefTip} />
      </RevealItem>
    </motion.div>
  );
}
