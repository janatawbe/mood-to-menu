import { Button } from "../../components/Button";
import { HeartIcon } from "../../components/icons";

interface FavoritesEmptyStateProps {
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/**
 * A bespoke, warmer empty state (Milestone 8 UI pass) — unlike the plain dashed-border
 * `EmptyState` used by History/Grocery List, this one leans into the "personal cookbook"
 * framing with a solid warm card and a larger filled heart, so even an empty Favorites
 * screen still feels inviting rather than utilitarian.
 */
export function FavoritesEmptyState({ hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: FavoritesEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-4xl border border-tan-200/60 bg-cream-soft px-8 py-10 text-center shadow-soft">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent-strong">
          <HeartIcon width={28} height={28} fill="currentColor" />
        </span>
        <p className="font-display text-xl font-bold text-ink">Your favorites are waiting to happen.</p>
        <p className="text-sm text-ink-muted">Save recipes you love and build your own little cookbook.</p>
      </div>
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
