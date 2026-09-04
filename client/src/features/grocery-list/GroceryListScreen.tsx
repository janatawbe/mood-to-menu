import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import type { UseGroceryListReturn } from "../../hooks/useGroceryList";
import { groupGroceryItems } from "../../lib/groceryCategories";
import { GroceryCategorySection } from "./GroceryCategorySection";
import { GroceryListActions } from "./GroceryListActions";
import { GroceryListEmptyState } from "./GroceryListEmptyState";
import { GrocerySummary } from "./GrocerySummary";

interface GroceryListScreenProps {
  groceryList: UseGroceryListReturn;
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/**
 * The real, persistent Grocery List (Milestone 6) — replaces the "coming soon"
 * placeholder. Deliberately stays in the permanent warm cream/orange brand language
 * rather than tinting itself to whichever mood was last active (Step 27): this list can
 * hold ingredients from many recipes/moods over time, so it should read as a stable,
 * practical utility rather than another mood-themed screen.
 */
export function GroceryListScreen({ groceryList, hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: GroceryListScreenProps) {
  const { items, summary, toggleChecked, removeItem, clearCompleted, clearAll } = groceryList;
  const groups = groupGroceryItems(items);

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <SectionHeader title="Grocery List" subtitle="Everything you need, all in one place." />

      {items.length === 0 ? (
        <GroceryListEmptyState hasRecipe={hasRecipe} onGoToTodaysMenu={onGoToTodaysMenu} onGoToVibeCheck={onGoToVibeCheck} />
      ) : (
        <>
          <GrocerySummary total={summary.total} checked={summary.checked} />

          <div className="mt-3">
            <GroceryListActions
              hasCompleted={summary.checked > 0}
              hasItems={summary.total > 0}
              onClearCompleted={clearCompleted}
              onClearAll={clearAll}
            />
          </div>

          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
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
          </div>
        </>
      )}
    </Panel>
  );
}
