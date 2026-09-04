import { useState } from "react";
import { Button } from "../../components/Button";

interface GroceryListActionsProps {
  hasCompleted: boolean;
  hasItems: boolean;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

/**
 * "Clear completed" is the required action. "Clear all" is the optional secondary one —
 * implemented with a lightweight inline confirm (a second row that appears in place)
 * rather than `window.confirm`, since it's destructive but a full modal would be
 * disproportionate for one list.
 */
export function GroceryListActions({ hasCompleted, hasItems, onClearCompleted, onClearAll }: GroceryListActionsProps) {
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);

  if (confirmingClearAll) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
        <span className="text-ink-soft">Remove all items?</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onClearAll();
            setConfirmingClearAll(false);
          }}
        >
          Yes, clear all
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmingClearAll(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="ghost" size="sm" onClick={() => setConfirmingClearAll(true)} disabled={!hasItems}>
        Clear all
      </Button>
      <Button variant="secondary" size="sm" onClick={onClearCompleted} disabled={!hasCompleted}>
        Clear completed
      </Button>
    </div>
  );
}
