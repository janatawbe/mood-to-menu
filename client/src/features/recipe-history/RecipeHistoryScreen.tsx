import { useState } from "react";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import { groupByRelativeDay, formatSavedTimestamp } from "../../lib/dateGroups";
import { filterSavedRecipes, type MoodFilter } from "../../lib/savedRecipeSearch";
import type { UseRecipeHistoryReturn } from "../../hooks/useRecipeHistory";
import type { Recipe } from "../../types/domain";
import { NoSearchResults } from "../saved-recipes/NoSearchResults";
import { SavedRecipeCard } from "../saved-recipes/SavedRecipeCard";
import { SavedRecipeFilters } from "../saved-recipes/SavedRecipeFilters";
import { RecipeHistoryEmptyState } from "./RecipeHistoryEmptyState";

interface RecipeHistoryScreenProps {
  history: UseRecipeHistoryReturn;
  onOpenRecipe: (recipe: Recipe) => void;
  onGoToVibeCheck: () => void;
}

/**
 * The real, persistent Recipe History screen (Milestone 8) — replaces the "coming soon"
 * placeholder. Newest-generated-first, grouped into Today/Yesterday/Earlier sections
 * (Step 16), with the same local search + mood filtering as Favorites.
 */
export function RecipeHistoryScreen({ history, onOpenRecipe, onGoToVibeCheck }: RecipeHistoryScreenProps) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<MoodFilter>("all");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const visible = filterSavedRecipes(history.history, query, mood);
  const groups = groupByRelativeDay(visible, (entry) => entry.generatedAt);

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title="Recipe History" subtitle="Every recipe you've generated, newest first." />
        {history.history.length > 0 &&
          (confirmingClear ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-soft">Remove all history?</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  history.clearHistory();
                  setConfirmingClear(false);
                }}
              >
                Yes, clear history
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(true)}>
              Clear history
            </Button>
          ))}
      </div>

      {history.history.length === 0 ? (
        <RecipeHistoryEmptyState onGoToVibeCheck={onGoToVibeCheck} />
      ) : (
        <>
          <div className="mt-3">
            <SavedRecipeFilters query={query} onQueryChange={setQuery} mood={mood} onMoodChange={setMood} searchLabel="Search history" />
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            {visible.length === 0 ? (
              <NoSearchResults
                onClear={() => {
                  setQuery("");
                  setMood("all");
                }}
              />
            ) : (
              <div className="flex flex-col gap-5 pb-2">
                {groups.map((group) => (
                  <section key={group.label}>
                    <h3 className="mb-2 font-display text-sm font-bold text-ink-soft">{group.label}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {group.entries.map(({ recipe, generatedAt }) => (
                        <SavedRecipeCard
                          key={`${recipe.id}-${generatedAt}`}
                          recipe={recipe}
                          timestampLabel={formatSavedTimestamp(generatedAt)}
                          onOpen={() => onOpenRecipe(recipe)}
                          onRemove={() => history.removeEntry(recipe.id)}
                          removeLabel={`Remove ${recipe.dishName} from History`}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
