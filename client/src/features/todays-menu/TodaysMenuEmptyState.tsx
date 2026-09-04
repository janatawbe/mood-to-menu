import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { CalendarIcon } from "../../components/icons";

interface TodaysMenuEmptyStateProps {
  onStartVibeCheck: () => void;
}

export function TodaysMenuEmptyState({ onStartVibeCheck }: TodaysMenuEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <EmptyState
        icon={<CalendarIcon width={26} height={26} />}
        title="Nothing on the menu yet"
        description="Tell me how you're feeling and I'll cook up something for you."
      />
      <Button variant="primary" onClick={onStartVibeCheck} className="mt-5">
        Start a Vibe Check
      </Button>
    </div>
  );
}
