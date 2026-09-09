import { Button } from "../../components/Button";

interface RecentlyGeneratedErrorStateProps {
  message: string;
  onRetry: () => void;
}

/** Shown only within the "Recently Generated" section when its own fetch fails — never
 * affects any other part of the app (see usePublicRecipes). */
export function RecentlyGeneratedErrorState({ message, onRetry }: RecentlyGeneratedErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">Couldn&apos;t load Recently Generated.</p>
      <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
        Try again
      </Button>
    </div>
  );
}
