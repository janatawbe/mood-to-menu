import { motion, useReducedMotion } from "motion/react";
import plantImage from "../../assets/decorations/plant.webp";

/** Ambient warm glow behind the shell — soft light-source wash plus a few blurred blobs. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(255,203,156,0.35) 0%, rgba(255,203,156,0) 55%), radial-gradient(90% 70% at 100% 100%, rgba(245,129,58,0.14) 0%, rgba(245,129,58,0) 60%)",
        }}
      />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-100/50 blur-3xl" />
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
