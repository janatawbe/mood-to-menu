// Loads and validates environment variables at server startup.
import "dotenv/config";

function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? Number(raw) : 3001;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3001;
}

// Centralized default, overridable via GEMINI_MODEL. Pinned to a specific stable id on
// purpose (never `gemini-flash-latest`) so behavior never changes silently underneath
// this app.
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
