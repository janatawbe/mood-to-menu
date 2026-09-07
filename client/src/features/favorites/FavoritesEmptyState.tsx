import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { HeartIcon } from "../../components/icons";

interface FavoritesEmptyStateProps {
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/** Mirrors GroceryListEmptyState's pattern (icon + title + description + one primary
 * CTA, chosen from current app state rather than always the same one). */
export function FavoritesEmptyState({ hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: FavoritesEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <EmptyState
        icon={<HeartIcon width={26} height={26} />}
        title="No favorites yet"
        description="Save a recipe you love and it'll be waiting for you here."
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
