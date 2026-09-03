import { BrandMark } from "./BrandMark";

interface AppLogoProps {
  size?: "sm" | "lg";
  showTagline?: boolean;
}

export function AppLogo({ size = "sm", showTagline = true }: AppLogoProps) {
  const isLarge = size === "lg";

  return (
    <div className={`flex flex-col items-center ${isLarge ? "gap-2" : "gap-1"}`}>
      <BrandMark
        width={isLarge ? 56 : 44}
        height={isLarge ? 56 : 44}
        className="text-brand-accent-strong"
        aria-hidden
      />
      <span
        className={`font-script font-bold leading-none text-ink ${
          isLarge ? "text-5xl" : "text-3xl"
        }`}
      >
        Mood-to-Menu
      </span>
      {showTagline && (
        <span
          className={`font-display font-semibold text-brand-accent-strong ${
            isLarge ? "text-base" : "text-sm"
          }`}
        >
          Food that feels you.
        </span>
      )}
    </div>
  );
}
