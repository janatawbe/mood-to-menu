import { ChefHatIcon } from "../../components/icons";

interface ChefTipCardProps {
  chefTip: string;
}

/** The real Gemini chefTip, given its own note-card treatment — never a second,
 * frontend-invented tip. */
export function ChefTipCard({ chefTip }: ChefTipCardProps) {
  return (
    <section
      aria-labelledby="chef-tip-heading"
      className="rounded-3xl border-2 border-brand-accent/40 bg-cream-soft p-4 shadow-soft sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent-strong">
          <ChefHatIcon width={17} height={17} />
        </span>
        <h2 id="chef-tip-heading" className="font-display text-base font-bold text-ink">
          Chef&apos;s Tip
        </h2>
      </div>
      <p className="mt-2 max-w-prose text-sm italic leading-relaxed text-ink-soft">{chefTip}</p>
    </section>
  );
}
