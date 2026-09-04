import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { CartIcon } from "../../components/icons";

interface GroceryListEmptyStateProps {
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/** Mirrors TodaysMenuEmptyState's pattern (icon + title + description + one primary
 * CTA) — the chef mascot itself lives permanently in the sidebar, so "use the chef"
 * here means staying consistent with that established empty-state look, not duplicating
 * a second chef illustration in the main content area. */
export function GroceryListEmptyState({ hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: GroceryListEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <EmptyState
        icon={<CartIcon width={26} height={26} />}
        title="Your grocery list is empty"
        description="Add ingredients from Today's Menu and I'll keep them organized here."
      />
      {hasRecipe ? (
        <Button variant="primary" onClick={onGoToTodaysMenu} className="mt-5">
          Go to Today&apos;s Menu
        </Button>
      ) : (
        <Button variant="primary" onClick={onGoToVibeCheck} className="mt-5">
          Start a Vibe Check
        </Button>
      )}
    </div>
  );
}
