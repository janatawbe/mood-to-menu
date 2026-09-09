import { motion, useReducedMotion } from "motion/react";
import { SparkleIcon } from "../../components/icons";
import { ChefCharacter } from "../shell/ChefCharacter";

interface ChefIntroOverlayProps {
  onDismiss: () => void;
}

/**
 * Centered onboarding popup shown on first open. The chef shares a `layoutId` with the
 * sidebar's chef (ChefMascot) — when this overlay unmounts and the sidebar chef mounts
 * in the same update, Motion animates the real position/size difference between them as
 * one shared-element transition. It sits outside the card's own `overflow-hidden` so
 * that transition is never clipped.
 */
export function ChefIntroOverlay({ onDismiss }: ChefIntroOverlayProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-[45] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: prefersReducedMotion ? 0.15 : 0.35 } }}
      transition={{ duration: prefersReducedMotion ? 0.15 : 0.35 }}
    >
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-sm" aria-hidden />

      <div className="relative flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-200/50 blur-3xl"
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.div layoutId="chef-mascot" className="relative z-10">
          <ChefCharacter className="w-[220px] sm:w-[260px]" />
        </motion.div>

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chef-intro-heading"
          className="relative mt-2 flex w-full flex-col items-center overflow-hidden rounded-4xl border border-tan-200/60 bg-surface p-7 text-center shadow-lift sm:p-9"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: -8,
            transition: { duration: prefersReducedMotion ? 0.15 : 0.3 },
          }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* `top-8` (32px) sits inside the padding gutter above the heading on desktop
              (p-9 = 36px top padding there), but on mobile the card only has p-7 = 28px
              padding, so the same 32px offset fell 4px into the heading's own box and
              overlapped its first line whenever it wrapped. `top-1` (4px) keeps the
              star's bottom edge (4px + 22px icon height = 26px) a couple of pixels above
              that 28px padding boundary — a purely vertical guarantee that holds at any
              mobile width, independent of how the heading text wraps. `sm:top-8` restores
              the original, already-correct desktop position unchanged. */}
          <motion.span
            className="pointer-events-none absolute top-1 right-8 text-brand-accent sm:top-8"
            aria-hidden
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <SparkleIcon width={22} height={22} />
          </motion.span>

          <h2 id="chef-intro-heading" className="font-display text-2xl font-bold text-ink sm:text-[1.75rem]">
            Hey there! I&apos;m your AI Chef.
          </h2>
          <p className="mt-3 max-w-xs text-sm text-ink-muted sm:text-base">
            Tell me how you feel, and I&apos;ll help turn your mood into something delicious.
          </p>

          <button
            type="button"
            onClick={onDismiss}
            autoFocus
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-brand-accent-strong px-6 py-3 font-display text-base font-bold text-white shadow-soft transition-all duration-200 hover:bg-accent-800 hover:shadow-lift"
          >
            Let&apos;s cook!
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
