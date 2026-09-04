import { motion, useReducedMotion } from "motion/react";
import { CloseIcon, CheckIcon } from "../../components/icons";
import { IconButton } from "../../components/IconButton";
import type { GroceryItem } from "../../types/domain";

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * A real `<input type="checkbox">` drives the checked state (visually hidden but fully
 * keyboard/screen-reader operable via `sr-only` + `peer-*`) — never a clickable div. The
 * remove button is a sibling of the `<label>`, not nested inside it, so clicking it can
 * never also toggle the checkbox the way a nested interactive element inside a label
 * sometimes does.
 */
export function GroceryItemRow({ item, onToggle, onRemove }: GroceryItemRowProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-start gap-2 rounded-2xl px-1 py-2 transition-colors hover:bg-cream-soft/60">
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => onToggle(item.id)}
            className="peer sr-only"
            aria-label={`Mark ${item.name} as ${item.checked ? "not done" : "done"}`}
          />
          <span
            aria-hidden
            className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-tan-200 bg-surface transition-colors duration-150 peer-checked:border-brand-accent-strong peer-checked:bg-brand-accent-strong peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent peer-focus-visible:ring-offset-2"
          >
            <motion.span
              initial={false}
              animate={
                prefersReducedMotion
                  ? { opacity: item.checked ? 1 : 0 }
                  : { scale: item.checked ? 1 : 0, opacity: item.checked ? 1 : 0 }
              }
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.2, ease: "backOut" }}
            >
              <CheckIcon width={13} height={13} className="text-white" />
            </motion.span>
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-semibold ${
              item.checked ? "text-ink-muted line-through decoration-tan-200" : "text-ink"
            }`}
          >
            {item.name}
          </span>
          <span className={`block truncate text-xs ${item.checked ? "text-ink-muted/70 line-through" : "text-ink-soft"}`}>
            {item.amount}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-ink-muted">From {item.sourceRecipe.dishName}</span>
        </span>
      </label>

      <IconButton
        icon={<CloseIcon width={14} height={14} />}
        label={`Remove ${item.name}`}
        onClick={() => onRemove(item.id)}
        className="mt-0.5 h-8 w-8 shrink-0"
      />
    </div>
  );
}
