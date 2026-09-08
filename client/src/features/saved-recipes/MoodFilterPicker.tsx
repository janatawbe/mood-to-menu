import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRightIcon, CheckIcon } from "../../components/icons";
import { moodThemes } from "../../lib/moodTheme";
import type { MoodFilter } from "../../lib/savedRecipeSearch";
import { moodPreviewEntries } from "../shell/moodPreviewData";

interface MoodOption {
  value: MoodFilter;
  label: string;
  /** null for "All moods" — the one genuinely neutral option, drawn as an outlined ring
   * rather than one of the six established mood colors. */
  dotColor: string | null;
}

const allMoodsOption: MoodOption = { value: "all", label: "All moods", dotColor: null };

const options: MoodOption[] = [
  allMoodsOption,
  ...moodPreviewEntries.map((entry) => ({
    value: entry.mood,
    label: entry.label,
    dotColor: moodThemes[entry.mood].accent,
  })),
];

interface MoodFilterPickerProps {
  mood: MoodFilter;
  onMoodChange: (mood: MoodFilter) => void;
}

interface PanelPosition {
  top: number;
  right: number;
}

/**
 * Custom mood picker shared by Favorites and Recipe History, replacing a native
 * `<select>` so each option can show its `moodThemes` accent dot ("All moods" stays a
 * neutral outlined ring).
 *
 * Follows the WAI-ARIA "collapsible listbox" pattern: the listbox owns focus while open
 * (`tabIndex={-1}`) and tracks the active option via `aria-activedescendant` rather than
 * moving focus per-option; Escape/outside-click close without changing the selection.
 *
 * Renders through a portal to `document.body` with `fixed` coordinates from the
 * trigger's bounding box, since both hosts clip an absolutely-positioned popover via
 * their own `overflow-hidden` scroll area. Unmounts immediately on close (no exit
 * animation) rather than animating out.
 */
export function MoodFilterPicker({ mood, onMoodChange }: MoodFilterPickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [activeIndex, setActiveIndex] = useState(() => options.findIndex((option) => option.value === mood));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const selected = options.find((option) => option.value === mood) ?? allMoodsOption;

  function openMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === mood)));
    setOpen(true);
  }

  useEffect(() => {
    if (open) listboxRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !listboxRef.current?.contains(target)) setOpen(false);
    }
    // A resize (or the page scrolling, not this list's own internal scroll area) can make
    // the stored position stale — closing rather than repositioning keeps this simple.
    function handleWindowChange() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [open]);

  function commitSelection(index: number) {
    const option = options[index];
    if (option) onMoodChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commitSelection(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, scale: 0.97, y: -4 }, visible: { opacity: 1, scale: 1, y: 0 } };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={`${baseId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="mood-focus-ring flex shrink-0 items-center gap-1.5 rounded-2xl border border-tan-200 bg-cream-soft px-3 py-2 text-sm font-medium text-ink-soft shadow-soft transition-colors duration-150 hover:bg-tan-100 hover:text-ink"
      >
        {selected.dotColor ? (
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selected.dotColor }} />
        ) : (
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink-muted" />
        )}
        <span>{selected.label}</span>
        <ChevronRightIcon width={13} height={13} className={`shrink-0 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {open &&
        position &&
        createPortal(
          <motion.ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label="Filter by mood"
            aria-activedescendant={optionId(activeIndex)}
            tabIndex={-1}
            onKeyDown={handleListboxKeyDown}
            initial="hidden"
            animate="visible"
            variants={panelVariants}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.15, ease: "easeOut" }}
            style={{ top: position.top, right: position.right }}
            // `space-y-1` gives adjacent options a small gap — without it, a selected
            // option's filled background and the option hovered right next to it sit
            // edge-to-edge with no breathing room, so their rounded corners visually
            // collide instead of reading as two distinct rows.
            className="fixed z-50 w-48 space-y-1 rounded-3xl border border-tan-200 bg-surface p-1.5 shadow-lift focus:outline-none"
          >
            {options.map((option, index) => {
              const isSelected = option.value === mood;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commitSelection(index)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 text-sm transition-colors duration-100 ${
                    isSelected ? "bg-brand-accent-soft font-semibold text-ink" : "text-ink-soft"
                  } ${isActive && !isSelected ? "bg-tan-100" : ""}`}
                >
                  {option.dotColor ? (
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: option.dotColor }} />
                  ) : (
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink-muted" />
                  )}
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <CheckIcon width={14} height={14} className="shrink-0 text-brand-accent-strong" />}
                </li>
              );
            })}
          </motion.ul>,
          document.body,
        )}
    </>
  );
}
