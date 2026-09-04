import type { CSSProperties, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { IconButton } from "../../components/IconButton";
import { Tag } from "../../components/Tag";
import { ChefHatIcon, SendIcon } from "../../components/icons";
import type { UseVibeCheckReturn } from "../../hooks/useVibeCheck";
import { VIBE_CHECK_TEXT_LIMIT } from "../../hooks/useVibeCheck";
import { getFriendlyErrorMessage } from "../../lib/errorMessages";
import { darken, getMoodTheme, hexToRgba } from "../../lib/moodTheme";
import { quickInputOptions } from "./quickInputData";

interface VibeCheckInputCardProps {
  vibeCheck: UseVibeCheckReturn;
}

/**
 * The Vibe Check card's interactive footer — swaps between the editable form, a short
 * "chef is cooking" transition, and an error state, all inside the same footprint (via
 * `min-h`) so switching phases never shifts the heading, mood grid, or food-line
 * decoration below it.
 *
 * The form also renders for `phase === "captured"` (not just "idle"): once a recipe
 * exists, the actual reveal lives on the Today's Menu screen (see
 * ../todays-menu/TodaysMenuScreen), so returning to this card just means "edit and
 * resubmit," not "look at a summary again."
 */
export function VibeCheckInputCard({ vibeCheck }: VibeCheckInputCardProps) {
  const {
    phase,
    userText,
    setUserText,
    quickInputs,
    toggleQuickInput,
    canSubmit,
    canRetry,
    submit,
    retry,
    editVibeCheck,
    selectedMood,
    error,
  } = vibeCheck;
  const prefersReducedMotion = useReducedMotion();
  const fadeTransition = { duration: prefersReducedMotion ? 0.01 : 0.2 };
  const theme = getMoodTheme(selectedMood);
  const showForm = phase === "idle" || phase === "captured";

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (canSubmit) submit();
    }
  }

  return (
    <Card
      tone="cream"
      className="relative mt-3 flex min-h-[185px] flex-col overflow-hidden"
      style={
        theme
          ? {
              borderColor: hexToRgba(theme.accent, 0.35),
              // Keeps shadow-soft's glossy top inset highlight, just retints the outer
              // diffuse shadow toward the mood's accent instead of overwriting it.
              boxShadow: `inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 10px 30px -14px ${hexToRgba(theme.accent, 0.28)}`,
            }
          : undefined
      }
    >
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            className="flex-1"
          >
            <h3 className="font-display text-base font-bold text-ink">Or tell me more about your day…</h3>
            <div className="relative mt-3">
              <textarea
                value={userText}
                onChange={(event) => setUserText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Had a long day at work, feeling exhausted and need something comforting but quick."
                rows={2}
                maxLength={VIBE_CHECK_TEXT_LIMIT}
                aria-label="Tell me more about your day"
                className="mood-focus-ring w-full resize-none rounded-2xl border border-tan-200 bg-surface p-4 pb-6 pr-14 text-sm text-ink placeholder:text-ink-muted"
                style={
                  theme
                    ? ({
                        borderColor: hexToRgba(theme.accent, 0.45),
                        "--mood-focus-color": theme.accent,
                        "--mood-focus-glow": hexToRgba(theme.accent, 0.3),
                      } as CSSProperties)
                    : undefined
                }
              />
              <span className="absolute bottom-3 right-14 text-xs text-ink-muted">
                {userText.length}/{VIBE_CHECK_TEXT_LIMIT}
              </span>
              <IconButton
                icon={<SendIcon width={16} height={16} />}
                label="Send Vibe Check"
                disabled={!canSubmit}
                onClick={submit}
                className={`absolute bottom-3 right-3 text-white hover:text-white disabled:cursor-not-allowed disabled:bg-tan-200 disabled:text-ink-muted ${
                  theme && canSubmit ? "mood-hover-bg" : "bg-brand-accent-strong hover:bg-accent-800"
                }`}
                style={
                  theme && canSubmit
                    ? ({
                        backgroundColor: theme.accentStrong,
                        "--mood-hover-bg": darken(theme.accentStrong, 0.15),
                      } as CSSProperties)
                    : undefined
                }
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickInputOptions.map((chip) => (
                <Tag
                  key={chip}
                  label={chip}
                  selected={quickInputs.includes(chip)}
                  mood={selectedMood}
                  onClick={() => toggleQuickInput(chip)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            role="status"
            className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
          >
            <motion.div
              className="text-brand-accent-strong"
              animate={prefersReducedMotion ? undefined : { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
              transition={prefersReducedMotion ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChefHatIcon width={38} height={38} />
            </motion.div>
            <p className="font-display text-base font-bold text-ink">
              Cooking up something that matches your vibe…
            </p>
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-brand-accent"
                  animate={
                    prefersReducedMotion ? { opacity: 0.7 } : { opacity: [0.3, 1, 0.3], y: [0, -4, 0] }
                  }
                  transition={
                    prefersReducedMotion ? undefined : { duration: 0.9, repeat: Infinity, delay: i * 0.15 }
                  }
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "error" && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            role="status"
            className="flex flex-1 flex-col items-center justify-center gap-2 text-center"
          >
            <ChefHatIcon width={30} height={30} className="text-ink-muted" />
            <p className="font-display text-base font-bold text-ink">Hmm, that didn't work.</p>
            <p className="max-w-xs text-sm text-ink-muted">{getFriendlyErrorMessage(error.code)}</p>
            <div className="mt-1 flex gap-2">
              <Button variant="primary" size="sm" onClick={retry} disabled={!canRetry}>
                Try again
              </Button>
              <Button variant="secondary" size="sm" onClick={editVibeCheck}>
                Edit Vibe Check
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
