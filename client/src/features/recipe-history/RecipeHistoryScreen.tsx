import { useState } from "react";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import { groupByRelativeDay, formatSavedTimestamp } from "../../lib/dateGroups";
import { filterSavedRecipes, type MoodFilter } from "../../lib/savedRecipeSearch";
import type { UseRecipeHistoryReturn } from "../../hooks/useRecipeHistory";
import type { Recipe } from "../../types/domain";
import { NoSearchResults } from "../saved-recipes/NoSearchResults";
import { SavedRecipeFilters } from "../saved-recipes/SavedRecipeFilters";
import { HistoryRow } from "./HistoryRow";
import { RecipeHistoryEmptyState } from "./RecipeHistoryEmptyState";

interface RecipeHistoryScreenProps {
  history: UseRecipeHistoryReturn;
  onOpenRecipe: (recipe: Recipe) => void;
  onGoToVibeCheck: () => void;
}

// Recipe History screen: newest-first, grouped by Today/Yesterday/Earlier, with the
// same local search + mood filtering as Favorites.
export function RecipeHistoryScreen({ history, onOpenRecipe, onGoToVibeCheck }: RecipeHistoryScreenProps) {
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState<MoodFilter>("all");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const visible = filterSavedRecipes(history.history, query, mood);
  const groups = groupByRelativeDay(visible, (entry) => entry.generatedAt);

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title="Recipe History" subtitle="Your recent cooking journey, newest first." />
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
          {/* A plain utility row (vs. Favorites' rounded toolbar) — a thin border-bottom
              rather than a soft enclosing card, to keep this screen reading as compact
              controls above a list, not a decorated collection header. */}
          <div className="mt-3 border-b border-tan-200/60 pb-3">
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
              <div className="flex flex-col gap-4 pb-2">
                {groups.map((group) => (
                  <section key={group.label}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent-strong" />
                      <h3 className="text-xs font-bold tracking-wide text-ink-soft uppercase">{group.label}</h3>
                      <span aria-hidden className="h-px flex-1 bg-tan-200" />
                    </div>
                    <div className="flex flex-col divide-y divide-tan-200/60 overflow-hidden rounded-3xl border border-tan-200/60 bg-surface/70">
                      {group.entries.map(({ recipe, generatedAt }) => (
                        <HistoryRow
                          key={`${recipe.id}-${generatedAt}`}
                          recipe={recipe}
                          timeLabel={formatSavedTimestamp(generatedAt)}
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
