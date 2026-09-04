import { motion, useReducedMotion, type Transition } from "motion/react";
import { ChefCharacter } from "./ChefCharacter";

/** Subtle contextual state for the sidebar chef during a Vibe Check — deliberately
 * light-touch for Milestone 2; the fuller chef personality system is Milestone 9. */
export type ChefStatus = "welcoming" | "attentive" | "cooking";

interface ChefMascotProps {
  /** Whether the chef has finished its intro and settled into the sidebar. */
  arrived: boolean;
  status?: ChefStatus;
}

const CHEF_WIDTH = 225;
/** Matches the cropped chef.webp's own aspect ratio, so the placeholder below reserves
 * exactly the space the real image will occupy — no layout jump on arrival. */
const CHEF_ASPECT = "1102 / 1154";

/**
 * A soft cream/white speech bubble — rounded rectangle body with a small tail pointing
 * down-left toward the chef — sitting beside his head rather than a separate status
 * badge above him.
 */
function ReadyToHelpCloud({ status }: { status: ChefStatus }) {
  const prefersReducedMotion = useReducedMotion();
  const message = status === "cooking" ? "Cooking..." : "Ready to help!";

  return (
    <motion.div
      className="relative h-[58px] w-[108px]"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -3, 0] }}
      transition={
        prefersReducedMotion
          ? { duration: 0.3, delay: 0.3 }
          : {
              opacity: { duration: 0.35, delay: 0.35 },
              scale: { duration: 0.35, delay: 0.35 },
              y: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
            }
      }
    >
      <div className="absolute inset-0 -z-10 rounded-3xl bg-accent-200/25 blur-md" aria-hidden />

      <svg
        viewBox="0 0 108 58"
        className="absolute inset-0 h-full w-full drop-shadow-[0_7px_12px_rgba(59,42,32,0.2)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="bubbleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFEFB" />
            <stop offset="100%" stopColor="#FBF1E2" />
          </linearGradient>
        </defs>
        {/* tail — a real curved speech-bubble point, drawn first so the main body only
            covers its short attachment edge, leaving a clearly visible tail below it */}
        <path
          d="M17 40 Q11 49 9 55 Q14 50 26 41 Z"
          fill="url(#bubbleGrad)"
          stroke="#F0DABE"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* main body */}
        <rect x="3" y="2" width="102" height="40" rx="16" fill="url(#bubbleGrad)" stroke="#F0DABE" strokeWidth="1.3" />
        <ellipse cx="28" cy="13" rx="24" ry="7" fill="#FFFFFF" opacity="0.55" />
      </svg>

      <div className="absolute left-[3px] top-[2px] flex h-10 w-[102px] items-center justify-center px-2.5">
        <span className="text-center text-[10.5px] font-extrabold leading-tight tracking-tight text-ink">
          {message}
        </span>
      </div>
    </motion.div>
  );
}

/** A tiny extra gesture layered on top of ChefCharacter's own idle breathing — never
 * replaces it, just adds a little more life once the user is actively interacting. */
const reactionByStatus: Record<ChefStatus, { animate: Record<string, number[]>; transition: Transition }> = {
  welcoming: { animate: { rotate: [0], y: [0] }, transition: { duration: 0.3 } },
  attentive: {
    animate: { rotate: [0, -1.5, 0, 1.5, 0] },
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
  cooking: {
    animate: { y: [0, -4, 0], rotate: [0, -2, 2, 0] },
    transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" },
  },
};

export function ChefMascot({ arrived, status = "welcoming" }: ChefMascotProps) {
  const prefersReducedMotion = useReducedMotion();
  const reaction = reactionByStatus[status];

  return (
    <div className="relative mx-auto" style={{ width: CHEF_WIDTH }}>
      {arrived ? (
        <motion.div layoutId="chef-mascot" className="relative">
          {status === "cooking" && (
            <motion.div
              className="pointer-events-none absolute inset-x-8 inset-y-12 -z-10 rounded-full bg-accent-300/35 blur-2xl"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: prefersReducedMotion ? 0.5 : [0.3, 0.55, 0.3] }}
              transition={prefersReducedMotion ? { duration: 0.3 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.div
            animate={prefersReducedMotion ? undefined : reaction.animate}
            transition={prefersReducedMotion ? undefined : reaction.transition}
          >
            <ChefCharacter className="w-full" />
          </motion.div>
          {/* Kept within the chef's own bounding box (flush toward its right edge) so it
              can never clip the sidebar, regardless of how much side margin centering
              leaves at different sidebar widths. */}
          <div className="absolute left-[110px] top-[-14px]">
            <ReadyToHelpCloud status={status} />
          </div>
        </motion.div>
      ) : (
        // Reserves the exact same footprint so nothing shifts once the real chef arrives.
        <div aria-hidden style={{ width: CHEF_WIDTH, aspectRatio: CHEF_ASPECT }} />
      )}
    </div>
  );
}
