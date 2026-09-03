import type { SVGProps } from "react";

/**
 * The Mood-to-Menu chef's-toque mark. Built around the one silhouette cue that actually
 * reads as "chef hat" at a glance: a puffy cap that visibly overhangs a distinctly
 * narrower band, like a mushroom cap on a stalk — rather than a puff and band of similar
 * width, which reads more like a generic rounded blob. Filled white (not just outlined)
 * so the puffy shape has real visual weight against the sidebar background, with the
 * brand orange carried by the outline and the band.
 */
export function BrandMark({ width = 40, height = 40, className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      {/* puff — wide, rounded cap that clearly overhangs the band on both sides */}
      <path
        d="M8 33 C4 30 3 24 8 21 C5 16 10 9 17 10 C18 4 30 4 31 10 C38 9 43 16 40 21 C45 24 44 30 40 33 Z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* narrow band the puff sits on top of — the overhang is what sells the silhouette */}
      <rect x="15" y="33" width="18" height="10" rx="3" fill="#FFFFFF" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* small vertical pleat details inside the band */}
      <path d="M20 36v4M24 35.5v5M28 36v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
