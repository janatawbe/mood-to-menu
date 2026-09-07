import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { HistoryIcon } from "../../components/icons";

interface RecipeHistoryEmptyStateProps {
  onGoToVibeCheck: () => void;
}

/** Unlike Favorites/Grocery List, there's no "go to Today's Menu" branch here — a recipe
 * only ever lands in History once it's already been generated, so if History is empty,
 * the user genuinely hasn't generated anything yet this device. */
export function RecipeHistoryEmptyState({ onGoToVibeCheck }: RecipeHistoryEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <EmptyState
        icon={<HistoryIcon width={26} height={26} />}
        title="Nothing cooked yet"
        description="Every recipe you generate will show up here, newest first."
      />
      <Button variant="primary" onClick={onGoToVibeCheck} className="mt-5">
        Start a Vibe Check
      </Button>
    </div>
  );
}
