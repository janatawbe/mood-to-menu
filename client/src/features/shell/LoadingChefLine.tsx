// A small second line of loading-state chef personality, shown under the main heading.
import { useState } from "react";

// Short and concrete — never a fake progress percentage or step count.
const LOADING_LINES = ["Thinking up something good…", "Putting your mood on the menu…", "Almost plating it…"];

/** Picks one line at random and holds it for this component's lifetime — callers
 * remount it fresh each time a loading phase starts, so a new line shows per
 * generation with no prop threading or timer needed. */
export function LoadingChefLine() {
  const [line] = useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);
  return <p className="text-xs text-ink-muted">{line}</p>;
}
