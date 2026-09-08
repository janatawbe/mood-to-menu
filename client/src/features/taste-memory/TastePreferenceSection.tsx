// One reusable Taste Memory section: suggestion chips, custom entry, and saved chips.
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconButton } from "../../components/IconButton";
import { Tag } from "../../components/Tag";
import { CloseIcon, PlusIcon } from "../../components/icons";
import { TASTE_ENTRY_MAX_LENGTH } from "../../lib/tasteMemoryStorage";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

interface RemovableChipProps {
  label: string;
  onRemove: () => void;
}

/** A saved, freely-typed preference — filled brand-colored pill with its own small
 * remove control, distinct from the outlined `Tag` suggestion chips below. */
function RemovableChip({ label, onRemove }: RemovableChipProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.span
      layout={!prefersReducedMotion}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.2, ease: "easeOut" }}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-accent-strong bg-brand-accent-strong px-3.5 py-1.5 text-sm font-medium text-white"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/25"
      >
        <CloseIcon width={10} height={10} />
      </button>
    </motion.span>
  );
}

interface TastePreferenceSectionProps {
  title: string;
  helper?: string;
  values: string[];
  suggestions: string[];
  placeholder: string;
  /** Used only for the add button's accessible name, e.g. "comfort food" → "Add comfort food". */
  entryLabel: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

/**
 * One Taste Memory section: suggestion chips that toggle straight into the saved list,
 * a compact custom-entry input, and the saved custom entries (the ones not already
 * covered by a suggestion chip) as removable pills. Reused for all four Taste Memory
 * categories — the only thing that differs between them is copy/suggestions/handlers.
 */
export function TastePreferenceSection({
  title,
  helper,
  values,
  suggestions,
  placeholder,
  entryLabel,
  onAdd,
  onRemove,
}: TastePreferenceSectionProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  }

  const customValues = values.filter((value) => !suggestions.some((s) => normalize(s) === normalize(value)));

  return (
    <section>
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      {helper && <p className="mt-0.5 text-sm text-ink-muted">{helper}</p>}

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const selected = values.some((value) => normalize(value) === normalize(suggestion));
            return (
              <Tag
                key={suggestion}
                label={suggestion}
                selected={selected}
                onClick={() => (selected ? onRemove(suggestion) : onAdd(suggestion))}
              />
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          maxLength={TASTE_ENTRY_MAX_LENGTH}
          aria-label={`Add a ${entryLabel}`}
          className="mood-focus-ring w-full max-w-xs rounded-2xl border border-tan-200 bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted"
        />
        <IconButton
          icon={<PlusIcon width={16} height={16} />}
          label={`Add ${entryLabel}`}
          type="submit"
          disabled={!draft.trim()}
          className="shrink-0 bg-brand-accent-soft text-brand-accent-strong hover:bg-brand-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
        />
      </form>

      <div className="mt-2 flex flex-wrap gap-2 empty:mt-0">
        <AnimatePresence initial={false}>
          {customValues.map((value) => (
            <RemovableChip key={value} label={value} onRemove={() => onRemove(value)} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
