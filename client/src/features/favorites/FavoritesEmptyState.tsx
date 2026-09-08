import { Button } from "../../components/Button";
import { HeartIcon } from "../../components/icons";

interface FavoritesEmptyStateProps {
  hasRecipe: boolean;
  onGoToTodaysMenu: () => void;
  onGoToVibeCheck: () => void;
}

/**
 * A bespoke empty state (Milestone 8 UI pass) — leans into the "personal cookbook"
 * framing with a larger filled heart badge, unlike the plain icon used by History/
 * Grocery List's shared `EmptyState`. Its outer card now matches that shared
 * component's container language exactly (rounded-3xl, dashed tan border, no shadow)
 * so it reads as the same card family at a glance, even though the icon/copy stay
 * Favorites-specific.
 */
export function FavoritesEmptyState({ hasRecipe, onGoToTodaysMenu, onGoToVibeCheck }: FavoritesEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-6 py-16 text-center">
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
