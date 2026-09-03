import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BrandMark } from "../../components/BrandMark";
import { SparkleIcon } from "../../components/icons";

const INTRO_SEEN_KEY = "moodToMenuIntroSeen";
const FULL_INTRO_HOLD_MS = 1900;
const REDUCED_INTRO_HOLD_MS = 200;

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
  } catch {
    // If storage is unavailable, fail open rather than blocking the app on every load.
    return true;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");
  } catch {
    // Private browsing / disabled storage — nothing to persist, intro will just replay.
  }
}

interface IntroAnimationProps {
  children: ReactNode;
  /** Called once the logo intro is no longer showing (whether it played or was skipped). */
  onComplete?: () => void;
}

export function IntroAnimation({ children, onComplete }: IntroAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!showIntro) return;
    markIntroSeen();

    // A plain timeout drives dismissal (not animation callbacks), so the intro can never
    // block the app indefinitely even if a transition fails to fire.
    const holdDuration = prefersReducedMotion ? REDUCED_INTRO_HOLD_MS : FULL_INTRO_HOLD_MS;
    const timer = setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setShowIntro(false);
    }, holdDuration);

    return () => clearTimeout(timer);
    // Intentionally runs once: this effect owns the one-shot intro timer for this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip case only: if the intro was already seen this session, `showIntro` is false from
  // the very first render, so it will never unmount/exit — fire completion right away. The
  // real (played-then-dismissed) case fires via AnimatePresence's onExitComplete below,
  // timed to the exit animation actually finishing rather than merely starting, so the
  // chef popup's own entrance isn't partly hidden behind a still-fading splash screen.
  useEffect(() => {
    if (!showIntro) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      <AnimatePresence onExitComplete={onComplete}>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-cream"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.45, ease: "easeInOut" }}
          >
            {prefersReducedMotion ? (
              <div className="flex flex-col items-center gap-2 opacity-100">
                <BrandMark width={40} height={40} className="text-brand-accent-strong" />
                <span className="font-script text-4xl font-bold text-ink">Mood-to-Menu</span>
              </div>
            ) : (
              <div className="relative flex flex-col items-center gap-3">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-200/50 blur-3xl"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 0.7, scale: 1.15 }}
                  transition={{ duration: 1.3, ease: "easeOut" }}
                />

                <motion.span
                  className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-accent-soft text-brand-accent-strong shadow-lift"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <BrandMark width={40} height={40} />
                  <motion.span
                    className="absolute -right-2 -top-2 text-brand-accent"
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <SparkleIcon width={20} height={20} />
                  </motion.span>
                </motion.span>

                <motion.span
                  className="relative font-script text-5xl font-bold text-ink"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                >
                  Mood-to-Menu
                </motion.span>

                <motion.span
                  className="relative font-display text-sm font-semibold text-brand-accent-strong"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.85, ease: "easeOut" }}
                >
                  Food that feels you.
                </motion.span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
