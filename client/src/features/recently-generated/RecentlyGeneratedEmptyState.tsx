import { EmptyState } from "../../components/EmptyState";
import { GlobeIcon } from "../../components/icons";

/** Shown when the feed loaded successfully but no one has generated a public recipe
 * yet — distinct from the error state (see RecentlyGeneratedErrorState), which means
 * the feed failed to load at all. */
export function RecentlyGeneratedEmptyState() {
  return (
    <EmptyState
      icon={<GlobeIcon width={26} height={26} />}
      title="No recipes shared yet."
      description="Once people start generating recipes, the newest ones will show up here."
    />
  );
}
