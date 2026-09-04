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
 * stable Flash release) during Milestone 5 after repeated live 504 DEADLINE_EXCEEDED /
 * 503 UNAVAILABLE ("high demand") failures — a specific stable id on purpose, not
 * gemini-flash-latest, so behavior never changes silently underneath this app. */
const DEFAULT_GEMINI_MODEL = "gemini-3.7-flash";

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
