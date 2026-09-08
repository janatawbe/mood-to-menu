import { useState } from "react";

/** Short, concrete, food-focused — never implies a fake progress percentage or an
 * exact step count (Milestone 9, Step 10). Kept separate from the existing "Cooking up
 * something that matches your vibe…" heading (unchanged, already tested copy) — this is
 * a small second line underneath it, so the loading state has a little more personality
 * without repeating itself identically on every single generation. */
const LOADING_LINES = ["Thinking up something good…", "Putting your mood on the menu…", "Almost plating it…"];

/** Picks one line at random and holds it steady for the lifetime of this component
 * instance — callers remount it fresh each time a loading phase starts (it's rendered
 * conditionally on `phase === "loading"`), so a new line is picked per generation
 * without needing any prop threading or a timer. */
export function LoadingChefLine() {
  const [line] = useState(() => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)]);
  return <p className="text-xs text-ink-muted">{line}</p>;
}
