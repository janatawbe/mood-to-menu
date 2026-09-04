import "dotenv/config";

function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? Number(raw) : 3001;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3001;
}

/** Centralized so the model identifier is never scattered across the codebase — change
 * it here once if Google ships a newer Flash model. Overridable via GEMINI_MODEL for
 * local experimentation without a code change.
 *
 * gemini-2.5-flash (the model documented in the SDK's own README at integration time)
 * was confirmed via a live request during Milestone 4 to be retired for new API
 * keys/projects — Gemini's own error response named gemini-3.6-flash as the direct
 * replacement. gemini-3.6-flash was then swapped for gemini-3.7-flash (the current
 * stable Flash release) during Milestone 5, then several other Flash variants were
 * probed after repeated live 503 UNAVAILABLE ("high demand") responses. The actual root
 * cause turned out to be visible in Google AI Studio's free-tier rate limits, not the
 * model itself: this project's gemini-3.7-flash quota is 20 requests/day, and usage was
 * already over that (23/20 RPD) — every other Flash tier tried shares a similarly small
 * daily allowance. gemini-3.5-flash-lite (500 requests/day vs. gemini-3.7-flash's 20)
 * was tried next and fit Mood-to-Menu's short, single-turn structured-JSON generations
 * well, but gemini-3.1-flash-lite was confirmed via a live browser test to have better
 * availability on this specific free-tier project, so that's the current default
 * (exactly gemini-3.1-flash-lite, not gemini-3.1-flash-lite-preview, which has been shut
 * down). A specific stable id on purpose, never gemini-flash-latest, so behavior never
 * changes silently underneath this app. */
const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export const env = {
  port: getPort(),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  nodeEnv: process.env.NODE_ENV ?? "development",
};

/**
 * Fails fast and clearly if required configuration is missing, rather than letting the
 * server start and every recipe request fail with a confusing downstream error. Never
 * logs the key's value — only whether it's present.
 */
export function validateEnv(): void {
  const missing: string[] = [];
  if (!env.geminiApiKey) missing.push("GEMINI_API_KEY");

  if (missing.length > 0) {
    console.error(
      `\n[startup] Missing required environment variable(s): ${missing.join(", ")}.\n` +
        `[startup] Add them to server/.env (see server/.env.example) before starting the server.\n`,
    );
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}
