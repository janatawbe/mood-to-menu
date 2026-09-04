/**
 * Deliberately minimal, shape-only logging for recipe generation. Never logs the API
 * key, the full user prompt, or the full Gemini response — only what's useful for
 * development (mood/signal presence, model, timing, outcome category).
 */
export function logGenerationStart(input: { hasMood: boolean; hasText: boolean; chipCount: number }, model: string) {
  console.log(
    `[recipe] generation started model=${model} mood=${input.hasMood} text=${input.hasText} chips=${input.chipCount}`,
  );
}

export function logGenerationAttempt(attempt: number, outcome: "invalid_json" | "invalid_schema", detail: string) {
  console.warn(`[recipe] attempt ${attempt} ${outcome}: ${detail}`);
}

export function logGenerationSuccess(durationMs: number, attempt: number) {
  console.log(`[recipe] generation succeeded in ${durationMs}ms (attempt ${attempt})`);
}

export function logGenerationFailure(durationMs: number, code: string, detail?: string) {
  console.error(`[recipe] generation failed in ${durationMs}ms code=${code}${detail ? ` detail=${detail}` : ""}`);
}
