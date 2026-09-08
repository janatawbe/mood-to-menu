import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRightIcon, CheckIcon } from "../../components/icons";
import { ALL_MEALS, type MealFilter } from "../../lib/groceryMealFilter";
import type { GroceryItemSourceRecipe } from "../../types/domain";

interface MealOption {
  value: MealFilter;
  label: string;
}

const ALL_MEALS_OPTION: MealOption = { value: ALL_MEALS, label: "All meals" };

interface MealFilterPickerProps {
  meals: GroceryItemSourceRecipe[];
  value: MealFilter;
  onChange: (value: MealFilter) => void;
}

interface PanelPosition {
  top: number;
  right: number;
}

/**
 * "Filter by meal" (Milestone 9) — a custom accessible dropdown in the same family as
 * Favorites/Recipe History's MoodFilterPicker (same WAI-ARIA "collapsible listbox"
 * pattern, same portal-to-`document.body`-with-fixed-position technique, since this too
 * lives inside a panel with `overflow-hidden`), extended with a small search field
 * because the option list here is dynamic and can get long. The search field itself
 * behaves like a lightweight combobox: it owns `aria-activedescendant` pointing into the
 * listbox below it and handles all the same arrow/Enter/Escape keys MoodFilterPicker's
 * listbox does, so a keyboard user never has to move focus off the input to navigate.
 *
 * `meals` is the current, already-deduped-by-recipe-id option list (see
 * ../../lib/groceryMealFilter.ts) — this component only renders it and lets the caller
 * search-filter/select from it; it never touches Grocery List data itself.
 */
export function MealFilterPicker({ meals, value, onChange }: MealFilterPickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const allOptions: MealOption[] = [
    ALL_MEALS_OPTION,
    ...meals.map((meal) => ({ value: meal.id, label: meal.dishName })),
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions = normalizedQuery
    ? allOptions.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
    : allOptions;

  const selected = allOptions.find((option) => option.value === value) ?? ALL_MEALS_OPTION;

  // If the currently selected meal's items all disappeared (e.g. the last item from
  // that recipe was removed), it silently drops out of `meals`/`allOptions` — reset to
  // "All meals" immediately rather than leaving the screen stuck on a filter that no
  // longer matches anything.
  useEffect(() => {
    if (value !== ALL_MEALS && !meals.some((meal) => meal.id === value)) onChange(ALL_MEALS);
  }, [value, meals, onChange]);

  function openMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // The visible option list shrinks/reorders as the user types — rather than syncing
  // `activeIndex` back in an effect whenever that happens, just clamp it at read time so
  // it can never point past the end of a shorter filtered list.
  const clampedActiveIndex = Math.min(activeIndex, Math.max(0, visibleOptions.length - 1));

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !listboxRef.current?.contains(target) && !searchRef.current?.contains(target)) {
        setOpen(false);
      }
    }
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

  const commitSelection = useCallback(
    (index: number) => {
      const option = visibleOptions[index];
      if (option) onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [visibleOptions, onChange],
  );

  // Event delegation on the <ul> itself (one stable handler) rather than an inline
  // closure per <li> in the map below — keeps the ref-touching `commitSelection` call
  // out of the per-item render closures entirely.
  function optionIndexFromEvent(event: { target: EventTarget | null }): number | null {
    const el = event.target instanceof Element ? event.target.closest<HTMLElement>("li[data-index]") : null;
    if (!el) return null;
    const index = Number(el.dataset.index);
    return Number.isNaN(index) ? null : index;
  }

  function handleListClick(event: ReactMouseEvent<HTMLUListElement>) {
    const index = optionIndexFromEvent(event);
    if (index !== null) commitSelection(index);
  }

  function handleListMouseOver(event: ReactMouseEvent<HTMLUListElement>) {
    const index = optionIndexFromEvent(event);
    if (index !== null) setActiveIndex(index);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex(Math.min(clampedActiveIndex + 1, visibleOptions.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(Math.max(clampedActiveIndex - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        commitSelection(clampedActiveIndex);
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
        title={selected.label}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="mood-focus-ring flex max-w-[13rem] shrink-0 items-center gap-1.5 rounded-2xl border border-tan-200 bg-cream-soft px-3 py-2 text-sm font-medium text-ink-soft shadow-soft transition-colors duration-150 hover:bg-tan-100 hover:text-ink"
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected.label}</span>
        <ChevronRightIcon
          width={13}
          height={13}
          className={`shrink-0 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <motion.div
            initial="hidden"
            animate="visible"
            variants={panelVariants}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.15, ease: "easeOut" }}
            style={{ top: position.top, right: position.right }}
            className="fixed z-50 w-64 rounded-3xl border border-tan-200 bg-surface p-1.5 shadow-lift"
          >
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search meals…"
              aria-label="Search meals"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={visibleOptions.length > 0 ? optionId(clampedActiveIndex) : undefined}
              autoComplete="off"
              className="mood-focus-ring w-full rounded-2xl border border-tan-200 bg-cream-soft px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted"
            />

            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label="Filter by meal"
              // `space-y-1` gives adjacent options a small gap — without it, a selected
              // option's filled background and the option hovered right next to it sit
              // edge-to-edge with no breathing room, so their rounded corners visually
              // collide instead of reading as two distinct rows (same fix as
              // MoodFilterPicker's own listbox).
              className="mt-1.5 max-h-60 space-y-1 overflow-y-auto"
              onClick={handleListClick}
              onMouseOver={handleListMouseOver}
            >
              {visibleOptions.length === 0 ? (
                <li className="px-3 py-3 text-center text-sm text-ink-muted">No meals found.</li>
              ) : (
                visibleOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = index === clampedActiveIndex;
                  return (
                    <li
                      key={option.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      title={option.label}
                      data-index={index}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 text-sm transition-colors duration-100 ${
                        isSelected ? "bg-brand-accent-soft font-semibold text-ink" : "text-ink-soft"
                      } ${isActive && !isSelected ? "bg-tan-100" : ""}`}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {isSelected && <CheckIcon width={14} height={14} className="shrink-0 text-brand-accent-strong" />}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>,
          document.body,
        )}
    </>
  );
}
