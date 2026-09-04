interface InstructionsListProps {
  instructions: string[];
}

/** A real ordered list (`<ol>`) so cooking steps keep their semantic order for screen
 * readers, with a visually distinctive step-number treatment rather than cramped cards. */
export function InstructionsList({ instructions }: InstructionsListProps) {
  return (
    <section aria-labelledby="instructions-heading">
      <h2 id="instructions-heading" className="font-display text-base font-bold text-ink">
        Cooking Instructions
      </h2>
      <ol className="mt-3 flex flex-col gap-3">
        {instructions.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand-accent-soft font-display text-sm font-bold text-brand-accent-strong"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="pt-1 text-sm leading-relaxed text-ink-soft">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
