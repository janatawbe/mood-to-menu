import { motion, useReducedMotion } from "motion/react";
import { ChefCharacter } from "./ChefCharacter";

interface ChefMascotProps {
  /** Whether the chef has finished its intro and settled into the sidebar. */
  arrived: boolean;
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
function ReadyToHelpCloud() {
  const prefersReducedMotion = useReducedMotion();

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
          Ready to help!
        </span>
      </div>
    </motion.div>
  );
}

export function ChefMascot({ arrived }: ChefMascotProps) {
  return (
    <div className="relative mx-auto" style={{ width: CHEF_WIDTH }}>
      {arrived ? (
        <motion.div layoutId="chef-mascot" className="relative">
          <ChefCharacter className="w-full" />
          {/* Kept within the chef's own bounding box (flush toward its right edge) so it
              can never clip the sidebar, regardless of how much side margin centering
              leaves at different sidebar widths. */}
          <div className="absolute left-[110px] top-[-14px]">
            <ReadyToHelpCloud />
          </div>
        </motion.div>
      ) : (
        // Reserves the exact same footprint so nothing shifts once the real chef arrives.
        <div aria-hidden style={{ width: CHEF_WIDTH, aspectRatio: CHEF_ASPECT }} />
      )}
    </div>
  );
}
