import { useMemo, useState } from "react";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import type { UseGroceryListReturn } from "../../hooks/useGroceryList";
import { groupGroceryItems } from "../../lib/groceryCategories";
import { ALL_MEALS, deriveMealOptions, filterGroceryItemsByMeal, type MealFilter } from "../../lib/groceryMealFilter";
import { GroceryCategorySection } from "./GroceryCategorySection";
import { GroceryListActions } from "./GroceryListActions";
import { GroceryListEmptyState } from "./GroceryListEmptyState";
import { GrocerySummary } from "./GrocerySummary";
import { MealFilterPicker } from "./MealFilterPicker";
import { NoMealResults } from "./NoMealResults";

interface GroceryListScreenProps {
  groceryList: UseGroceryListReturn;
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

// Renders the persistent Grocery List, grouped by category with a meal filter.
//
// "Filter by meal" is purely a display filter: `summary` and every action below (Clear
// Completed, Clear All) always read from the full, unfiltered `items`/`summary`, never
// `visibleItems` — selecting a meal only changes what's rendered, not what counts or
// destructive actions operate on.
export function GroceryListScreen({ groceryList, hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: GroceryListScreenProps) {
  const { items, summary, toggleChecked, removeItem, clearCompleted, clearAll } = groceryList;
  const [mealFilter, setMealFilter] = useState<MealFilter>(ALL_MEALS);

  const meals = useMemo(() => deriveMealOptions(items), [items]);
  const visibleItems = useMemo(() => filterGroceryItemsByMeal(items, mealFilter), [items, mealFilter]);
  const groups = groupGroceryItems(visibleItems);

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <SectionHeader title="Grocery List" subtitle="Everything you need, all in one place." />

      {items.length === 0 ? (
        <GroceryListEmptyState hasRecipe={hasRecipe} onGoToTodaysMenu={onGoToTodaysMenu} onGoToVibeCheck={onGoToVibeCheck} />
      ) : (
        <>
          <GrocerySummary total={summary.total} checked={summary.checked} />

          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-ink-soft">Filter by meal</span>
            <MealFilterPicker meals={meals} value={mealFilter} onChange={setMealFilter} />
          </div>

          <div className="mt-3">
            <GroceryListActions
              hasCompleted={summary.checked > 0}
              hasItems={summary.total > 0}
              onClearCompleted={clearCompleted}
              onClearAll={clearAll}
            />
          </div>

          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
            {visibleItems.length === 0 ? (
              <NoMealResults onShowAllMeals={() => setMealFilter(ALL_MEALS)} />
            ) : (
              <div className="flex flex-col gap-4 pb-2">
                {groups.map((group) => (
                  <GroceryCategorySection
                    key={group.category}
                    category={group.category}
                    items={group.items}
                    onToggle={toggleChecked}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
