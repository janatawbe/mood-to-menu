import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import plantImage from "../../assets/decorations/plant.webp";
import { ambientWash, getMoodTheme, hexToRgba } from "../../lib/moodTheme";
import type { Mood } from "../../types/domain";

const DEFAULT_WASH = ambientWash("#FFCB9C", "#F5813A", 0.35, 0.14);

interface AmbientBackgroundProps {
  /** The currently selected Vibe Check mood, or null for the default warm atmosphere. */
  mood?: Mood | null;
}

/**
 * Ambient glow behind the shell — a soft light-source wash plus three blurred blobs.
 * With no mood selected this renders exactly the original Milestone 1 warm wash (static,
 * unanimated). Selecting a mood cross-fades the wash into that mood's own glow colors and
 * starts a very slow, mood-paced drift on the two largest blobs — "the page feels
 * illuminated by the mood" rather than recolored. The third (sage) blob stays a constant,
 * unthemed anchor so the app never fully loses its own identity under a mood tint.
 */
export function AmbientBackground({ mood = null }: AmbientBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const theme = getMoodTheme(mood);
  const fadeTransition = { duration: prefersReducedMotion ? 0.15 : 0.9, ease: "easeInOut" as const };
  const drift = theme && !prefersReducedMotion;
  const driftSeconds = theme?.driftSeconds ?? 14;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <AnimatePresence>
        <motion.div
          key={mood ?? "default"}
          className="absolute inset-0"
          style={{ background: theme ? ambientWash(theme.glow.primary, theme.glow.secondary) : DEFAULT_WASH }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
        />
      </AnimatePresence>

      <motion.div
        className="absolute -top-32 -left-24 h-96 w-96 rounded-full blur-3xl"
        animate={{
          backgroundColor: theme ? hexToRgba(theme.glow.primary, 0.4) : "rgba(255,203,156,0.4)",
          x: drift ? [0, 18, 0] : 0,
          y: drift ? [0, 14, 0] : 0,
        }}
        transition={{
          backgroundColor: fadeTransition,
          x: { duration: driftSeconds, repeat: Infinity, ease: "easeInOut" },
          y: { duration: driftSeconds * 1.15, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        animate={{
          backgroundColor: theme ? hexToRgba(theme.glow.secondary, 0.5) : "rgba(255,227,198,0.5)",
          x: drift ? [0, -16, 0] : 0,
        }}
        transition={{
          backgroundColor: fadeTransition,
          x: { duration: driftSeconds * 1.3, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-sage-soft/60 blur-3xl" />
    </div>
  );
}

/** Matches the cropped plant.webp's own aspect ratio, so the box sizes correctly without
 * ever stretching the image. */
const PLANT_ASPECT = "480 / 513";

/**
 * The real hanging-plant asset, anchored to the top-right corner so its cords appear to
 * originate from above the card (and get gently clipped by the card's own edge). Height is
 * capped with `clamp()` against viewport height — same technique as the food line — so it
 * scales down on short desktop windows instead of ever pushing the heading around, since
 * it's pinned with `position: absolute` and never participates in the panel's own flow.
 */
export function HangingPlantAccent({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className} style={{ height: "clamp(120px, 16vh, 168px)", aspectRatio: PLANT_ASPECT }} aria-hidden>
      <motion.img
        src={plantImage}
        alt=""
        className="h-full w-full object-contain"
        style={{ transformOrigin: "50% 0%" }}
        animate={prefersReducedMotion ? undefined : { rotate: [0, -1.4, 0, 1.4, 0] }}
        transition={prefersReducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
