import { motion, useReducedMotion, type Transition } from "motion/react";
import type { Mood } from "../../types/domain";

interface MoodCharacterProps {
  mood: Mood;
  className?: string;
  /** True while hovered, focused, or selected — drives this mood's micro-reaction.
   * Always treated as false when the user prefers reduced motion. */
  reacting?: boolean;
}

interface MoodMarkupProps {
  active: boolean;
}

function GroundShadow() {
  return <ellipse cx="50" cy="104" rx="21" ry="5.5" fill="#3B2A20" opacity="0.12" />;
}

function Sparkle({
  x,
  y,
  size = 6,
  color,
  active,
  delay = 0,
  duration = 1.1,
}: {
  x: number;
  y: number;
  size?: number;
  color: string;
  active: boolean;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.path
      d={`M${x} ${y - size} Q${x + size * 0.25} ${y - size * 0.25} ${x + size} ${y} Q${x + size * 0.25} ${y + size * 0.25} ${x} ${y + size} Q${x - size * 0.25} ${y + size * 0.25} ${x - size} ${y} Q${x - size * 0.25} ${y - size * 0.25} ${x} ${y - size} Z`}
      fill={color}
      style={{ transformOrigin: `${x}px ${y}px` }}
      animate={
        active
          ? { scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }
          : { scale: 1, opacity: 1 }
      }
      transition={active ? { duration, repeat: Infinity, ease: "easeInOut", delay } : { duration: 0.2 }}
    />
  );
}

function HeartMark({
  x,
  y,
  size = 7,
  color,
  active,
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  color: string;
  active: boolean;
  delay?: number;
}) {
  const s = size / 10;
  return (
    <motion.path
      transform={`translate(${x - 5 * s} ${y - 4.5 * s}) scale(${s})`}
      d="M5 8.5C2 6.3 0 4.6 0 2.6 0 1 1.2 0 2.6 0c.9 0 1.8.5 2.4 1.3C5.6.5 6.5 0 7.4 0 8.8 0 10 1 10 2.6c0 2-2 3.7-5 5.9Z"
      fill={color}
      style={{ transformOrigin: `${x}px ${y}px` }}
      animate={active ? { scale: [1, 1.22, 1] } : { scale: 1 }}
      transition={active ? { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay } : { duration: 0.2 }}
    />
  );
}

function CalmMarkup({ active }: MoodMarkupProps) {
  return (
    <>
      <defs>
        <radialGradient id="calmBody" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F1E9FB" />
          <stop offset="55%" stopColor="#C4AEEA" />
          <stop offset="100%" stopColor="#9678D1" />
        </radialGradient>
      </defs>
      <GroundShadow />
      <Sparkle x={13} y={22} size={7} color="#C9B8ED" active={active} delay={0} />
      <Sparkle x={87} y={30} size={5.6} color="#CDB6F0" active={active} delay={0.25} />
      <Sparkle x={78} y={12} size={4.3} color="#C9B8ED" active={active} delay={0.5} />
      <circle cx="50" cy="60" r="26" fill="url(#calmBody)" />
      <ellipse cx="40" cy="48" rx="9" ry="6" fill="#FFFFFF" opacity="0.35" />
      <ellipse cx="38" cy="68" rx="6" ry="4" fill="#E7B8D6" opacity="0.5" />
      <ellipse cx="62" cy="68" rx="6" ry="4" fill="#E7B8D6" opacity="0.5" />
      <path d="M38 58 Q42 62 46 58" stroke="#4A3B6B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M54 58 Q58 62 62 58" stroke="#4A3B6B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M43 72 Q50 77 57 72" stroke="#4A3B6B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  );
}

function StressedMarkup({ active }: MoodMarkupProps) {
  return (
    <>
      <defs>
        <radialGradient id="stressedBody" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#E4F1FB" />
          <stop offset="55%" stopColor="#9AC5E8" />
          <stop offset="100%" stopColor="#5E93C2" />
        </radialGradient>
      </defs>
      <GroundShadow />
      <motion.g
        animate={active ? { y: [0, -1.5, 0] } : { y: 0 }}
        transition={active ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        <ellipse cx="42" cy="13" rx="10.8" ry="8.1" fill="#8FA3B5" />
        <ellipse cx="54" cy="9.5" rx="13.4" ry="9.4" fill="#9DB0C2" />
        <ellipse cx="64" cy="14" rx="9.4" ry="7.4" fill="#8FA3B5" />
      </motion.g>
      <motion.path
        d="M40 23 L35.9 31.7M50 24 L45.9 34.1M60 23 L55.9 31.7"
        stroke="#5D9BD0"
        strokeWidth="2.9"
        strokeLinecap="round"
        animate={active ? { y: [0, 5, 0], opacity: [1, 0.35, 1] } : { y: 0, opacity: 1 }}
        transition={active ? { duration: 0.8, repeat: Infinity, ease: "easeIn" } : { duration: 0.2 }}
      />
      <circle cx="50" cy="62" r="26" fill="url(#stressedBody)" />
      <ellipse cx="40" cy="50" rx="9" ry="6" fill="#FFFFFF" opacity="0.3" />
      <ellipse cx="39" cy="70" rx="5.5" ry="3.5" fill="#F0B9CE" opacity="0.5" />
      <ellipse cx="61" cy="70" rx="5.5" ry="3.5" fill="#F0B9CE" opacity="0.5" />
      <path d="M35 52 L43 55M65 52 L57 55" stroke="#31506E" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="41" cy="61" rx="4.4" ry="5.4" fill="#FFFFFF" />
      <ellipse cx="59" cy="61" rx="4.4" ry="5.4" fill="#FFFFFF" />
      <circle cx="42" cy="63" r="2.2" fill="#233B52" />
      <circle cx="60" cy="63" r="2.2" fill="#233B52" />
      <path d="M42 76 Q46 73 50 76 Q54 79 58 76" stroke="#31506E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}

function TiredMarkup({ active }: MoodMarkupProps) {
  return (
    <>
      <defs>
        <radialGradient id="tiredBody" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#E7E0ED" />
          <stop offset="55%" stopColor="#B3A0C4" />
          <stop offset="100%" stopColor="#8B7699" />
        </radialGradient>
      </defs>
      <GroundShadow />
      <motion.g
        animate={active ? { rotate: [-4, -1, -4] } : { rotate: -4 }}
        style={{ transformOrigin: "50px 62px" }}
        transition={active ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <circle cx="50" cy="62" r="26" fill="url(#tiredBody)" />
        <ellipse cx="40" cy="50" rx="9" ry="6" fill="#FFFFFF" opacity="0.26" />
        <ellipse cx="36" cy="72" rx="5" ry="3.2" fill="#C9A9C7" opacity="0.4" />
        <ellipse cx="64" cy="72" rx="5" ry="3.2" fill="#C9A9C7" opacity="0.4" />
        <ellipse cx="41" cy="68" rx="5" ry="2" fill="#3E3350" opacity="0.14" />
        <ellipse cx="59" cy="68" rx="5" ry="2" fill="#3E3350" opacity="0.14" />
        <path d="M36 62 Q41 66 46 62" stroke="#3E3350" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M54 62 Q59 66 64 62" stroke="#3E3350" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M44 78 Q50 76 56 78" stroke="#3E3350" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </motion.g>
      {/* Zzz painted last (on top) so they're never covered by the body/face group above. */}
      <motion.text
        x="64"
        y="25"
        fontFamily="'Baloo 2', sans-serif"
        fontWeight="700"
        fontSize="18"
        fill="#8B7699"
        animate={active ? { y: [25, 17, 25], opacity: [1, 0.3, 1] } : { y: 25, opacity: 1 }}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        Z
      </motion.text>
      <motion.text
        x="79"
        y="14"
        fontFamily="'Baloo 2', sans-serif"
        fontWeight="700"
        fontSize="13.5"
        fill="#A793BB"
        animate={active ? { y: [14, 7, 14], opacity: [1, 0.3, 1] } : { y: 14, opacity: 1 }}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 } : { duration: 0.2 }}
      >
        z
      </motion.text>
      <motion.text
        x="56"
        y="8"
        fontFamily="'Baloo 2', sans-serif"
        fontWeight="700"
        fontSize="9.5"
        fill="#B9A8C9"
        animate={active ? { y: [8, 2, 8], opacity: [1, 0.3, 1] } : { y: 8, opacity: 1 }}
        transition={active ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 } : { duration: 0.2 }}
      >
        z
      </motion.text>
    </>
  );
}

function HappyMarkup({ active }: MoodMarkupProps) {
  const rays = Array.from({ length: 8 }, (_, i) => i);
  return (
    <>
      <defs>
        <radialGradient id="happyBody" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFF6D2" />
          <stop offset="55%" stopColor="#FFD84D" />
          <stop offset="100%" stopColor="#F5A623" />
        </radialGradient>
      </defs>
      <GroundShadow />
      <motion.g
        stroke="#FFC12A"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ transformOrigin: "50px 60px" }}
        animate={active ? { rotate: [0, 12, 0], scale: [1, 1.06, 1] } : { rotate: 0, scale: 1 }}
        transition={active ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        {rays.map((i) => {
          const angle = (i / rays.length) * Math.PI * 2;
          const x1 = 50 + Math.cos(angle) * 29;
          const y1 = 60 + Math.sin(angle) * 29;
          const x2 = 50 + Math.cos(angle) * 43;
          const y2 = 60 + Math.sin(angle) * 43;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </motion.g>
      <circle cx="50" cy="60" r="26" fill="url(#happyBody)" />
      <ellipse cx="40" cy="48" rx="9" ry="6" fill="#FFFFFF" opacity="0.4" />
      <ellipse cx="38" cy="66" rx="6" ry="4" fill="#F58B6B" opacity="0.55" />
      <ellipse cx="62" cy="66" rx="6" ry="4" fill="#F58B6B" opacity="0.55" />
      <path d="M35 56 Q40 50 45 56" stroke="#7A5A0E" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M55 56 Q60 50 65 56" stroke="#7A5A0E" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M39 69 Q50 69 61 69 Q61 82 50 82 Q39 82 39 69 Z" fill="#8A4B1E" />
      <path d="M41 70.5 Q50 72.5 59 70.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
    </>
  );
}

function EnergeticMarkup({ active }: MoodMarkupProps) {
  const sparks = [
    { x: 12, y: 18, size: 7 },
    { x: 89, y: 22, size: 5.6 },
    { x: 91, y: 52, size: 4.9 },
    { x: 7, y: 56, size: 4.9 },
  ];
  return (
    <>
      <defs>
        <radialGradient id="energeticGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFD9A6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFD9A6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="energeticOuterFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="55%" stopColor="#F5813A" />
          <stop offset="100%" stopColor="#D6551E" />
        </linearGradient>
        <linearGradient id="energeticInnerFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="70%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#FB8F4A" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="58" r="42" fill="url(#energeticGlow)" />
      <GroundShadow />
      {sparks.map((s, i) => (
        <Sparkle
          key={i}
          x={s.x}
          y={s.y}
          size={s.size}
          color={i % 2 ? "#FFC93C" : "#F5813A"}
          active={active}
          delay={i * 0.12}
          duration={0.55}
        />
      ))}
      <motion.g
        style={{ transformOrigin: "50px 58px" }}
        animate={active ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={active ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        <path
          d="M50 6 C56 16 68 20 66 34 C74 28 80 38 76 48 C86 44 88 58 78 64 C82 74 74 84 62 82 C64 92 50 98 50 98 C50 98 36 92 38 82 C26 84 18 74 22 64 C12 58 14 44 24 48 C20 38 26 28 34 34 C32 20 44 16 50 6 Z"
          fill="url(#energeticOuterFlame)"
        />
        <path
          d="M50 20 C54 30 62 32 60 42 C66 40 68 50 62 54 C68 58 64 68 56 66 C58 74 50 78 50 78 C50 78 42 74 44 66 C36 68 32 58 38 54 C32 50 34 40 40 42 C38 32 46 30 50 20 Z"
          fill="url(#energeticInnerFlame)"
          opacity="0.9"
        />
      </motion.g>
      <ellipse cx="41" cy="56" rx="5" ry="6" fill="#FFFFFF" />
      <ellipse cx="59" cy="56" rx="5" ry="6" fill="#FFFFFF" />
      <circle cx="42" cy="58" r="2.6" fill="#3B1204" />
      <circle cx="60" cy="58" r="2.6" fill="#3B1204" />
      <circle cx="43" cy="56.5" r="0.9" fill="#FFFFFF" />
      <circle cx="61" cy="56.5" r="0.9" fill="#FFFFFF" />
      <path d="M33 49 Q38 44 44 48M67 49 Q62 44 56 48" stroke="#8A2E0A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="66" rx="5" ry="3.5" fill="#FF6B3D" opacity="0.5" />
      <ellipse cx="64" cy="66" rx="5" ry="3.5" fill="#FF6B3D" opacity="0.5" />
      <ellipse cx="50" cy="70" rx="8" ry="9" fill="#7A230A" />
      <ellipse cx="50" cy="67" rx="5" ry="3" fill="#B4472A" />
    </>
  );
}

function CozyMarkup({ active }: MoodMarkupProps) {
  return (
    <>
      <defs>
        <radialGradient id="cozyBody" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FDEBD6" />
          <stop offset="55%" stopColor="#F3A96F" />
          <stop offset="100%" stopColor="#DD7C3E" />
        </radialGradient>
        <linearGradient id="cozyKnit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8935A" />
          <stop offset="100%" stopColor="#C9713E" />
        </linearGradient>
      </defs>
      <GroundShadow />
      <HeartMark x={14} y={19} size={8.1} color="#F0846B" active={active} delay={0} />
      <HeartMark x={85} y={25} size={6.3} color="#F09777" active={active} delay={0.2} />
      <HeartMark x={5} y={76} size={7} color="#F5A98A" active={active} delay={0.35} />
      <HeartMark x={93} y={81} size={7.3} color="#F0846B" active={active} delay={0.15} />

      {/* body */}
      <circle cx="50" cy="62" r="26" fill="url(#cozyBody)" />
      <ellipse cx="40" cy="50" rx="9" ry="6" fill="#FFFFFF" opacity="0.3" />

      {/* knit bobble hat — the clearest "bundled up" signal, absent from Calm */}
      <path d="M35 43 Q50 19 65 43 Z" fill="url(#cozyKnit)" />
      <path d="M34 44 L66 44" stroke="#B5643A" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M41 43 L42.5 33M47.3 43 L48.2 32M52.7 43 L51.8 32M59 43 L57.5 33"
        stroke="#B5643A"
        strokeWidth="1.1"
        opacity="0.55"
      />
      <HeartMark x={50} y={17} size={10.1} color="#EC7357" active={active} delay={0.1} />

      {/* wrapped blanket across the shoulders, with a ribbed knit texture */}
      <path
        d="M23 66 Q50 82 77 66 L75 85 Q50 96 25 85 Z"
        fill="url(#cozyKnit)"
        stroke="#B5643A"
        strokeWidth="1"
      />
      <path
        d="M30 71v15M39 75v15M50 77v15M61 75v15M70 71v15"
        stroke="#F5EEE2"
        strokeWidth="1.3"
        opacity="0.32"
        strokeLinecap="round"
      />

      {/* face */}
      <ellipse cx="39" cy="70" rx="6" ry="4" fill="#F5B58A" opacity="0.6" />
      <ellipse cx="61" cy="70" rx="6" ry="4" fill="#F5B58A" opacity="0.6" />
      <path d="M39 58 Q43 61 47 58" stroke="#6E3A17" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M53 58 Q57 61 61 58" stroke="#6E3A17" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M44 68 Q50 72 56 68" stroke="#6E3A17" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* steaming mug, held against the wrap */}
      <g transform="translate(50 75)">
        <path d="M-3 -3c-1-2 1-3 0-5M2 -3c-1-2 1-3 0-5" stroke="#DD7C3E" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65" />
        <rect x="-7" y="0" width="14" height="9" rx="2" fill="#F5EEE2" stroke="#C9AE8C" strokeWidth="1" />
        <ellipse cx="0" cy="9" rx="7" ry="2.2" fill="#E5CBA3" />
        <path d="M7 2c3-.5 5 1.5 5 3.5s-2 3.5-5 3" fill="none" stroke="#C9AE8C" strokeWidth="1.2" />
      </g>
    </>
  );
}

/** Each mood's own subtle root-level reaction — a small, distinct gesture (not just a
 * generic lift) so the six keep their separate personalities even while animating. */
const rootReactions: Record<Mood, { animate: Record<string, number[]>; transition: Transition }> = {
  calm: { animate: { y: [0, -5, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  stressed: {
    animate: { x: [0, -2, 2, -2, 0], y: [0, -2, -2, -2, 0] },
    transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
  },
  tired: { animate: { rotate: [-1.5, 1.5, -1.5], y: [0, -2, 0] }, transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" } },
  happy: { animate: { y: [0, -7, 0] }, transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" } },
  energetic: { animate: { y: [0, -8, 0] }, transition: { duration: 0.4, repeat: Infinity, ease: "easeOut" } },
  cozy: { animate: { y: [0, -3, 0], rotate: [-1, 1, -1] }, transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
};

const restTransition: Transition = { duration: 0.25, ease: "easeOut" };

/**
 * Illustrated per-mood characters. Each mood gets its own layered SVG (gradient body,
 * expression, and supporting motifs) rather than a shared face formula, so the six read
 * as distinct personalities even without their labels. `reacting` drives a small,
 * mood-specific micro-interaction (root gesture + accent motifs) on hover/focus/select.
 */
export function MoodCharacter({ mood, className = "", reacting = false }: MoodCharacterProps) {
  const prefersReducedMotion = useReducedMotion();
  const active = reacting && !prefersReducedMotion;
  const rootReaction = rootReactions[mood];

  return (
    <motion.svg
      viewBox="0 0 100 116"
      className={`h-full w-full ${className}`}
      aria-hidden
      animate={active ? rootReaction.animate : { x: 0, y: 0, rotate: 0 }}
      transition={active ? rootReaction.transition : restTransition}
    >
      {mood === "calm" && <CalmMarkup active={active} />}
      {mood === "stressed" && <StressedMarkup active={active} />}
      {mood === "tired" && <TiredMarkup active={active} />}
      {mood === "happy" && <HappyMarkup active={active} />}
      {mood === "energetic" && <EnergeticMarkup active={active} />}
      {mood === "cozy" && <CozyMarkup active={active} />}
    </motion.svg>
  );
}
