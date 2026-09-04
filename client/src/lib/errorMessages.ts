import type { RecipeErrorCode } from "../services/api";

/**
 * Frontend-owned copy for every recipe-generation error code, so the user always learns
 * WHAT kind of problem happened rather than one generic "the kitchen is busy" message —
 * never a raw provider/Gemini message or stack trace, which the backend never sends us
 * anyway (see server/src/services/gemini/errors.ts). `code` may be a string the frontend
 * doesn't recognize (a future backend error type) — falls back to the generic
 * INTERNAL_ERROR message rather than rendering nothing.
 *
 * `isDev` defaults to the real Vite dev flag but is an explicit parameter so it's easy to
 * test both branches without stubbing `import.meta.env`.
 */
export function getFriendlyErrorMessage(code: string, isDev: boolean = import.meta.env.DEV): string {
  switch (code as RecipeErrorCode) {
    case "RATE_LIMITED":
      return "The kitchen has a lot of orders right now. Give the chef a moment and try again.";
    case "TIMEOUT":
      return "This recipe is taking longer than expected. Your Vibe Check is still here — try again.";
    case "PROVIDER_UNAVAILABLE":
      return "The AI kitchen is temporarily unavailable. Try again shortly.";
    case "INVALID_OUTPUT":
      return "The chef couldn't finish that recipe properly. Let's cook up another one.";
    case "INVALID_REQUEST":
      return "Let's tweak your Vibe Check a little — add a mood, a note, or a quick pick, then try again.";
    case "CONFIG_ERROR":
      return isDev
        ? "The recipe service isn't configured correctly on the server (check server/.env). No request was sent to Gemini."
        : "Something isn't set up right in the kitchen. Please try again shortly.";
    case "NETWORK_ERROR":
      return "I couldn't reach the kitchen. Check your connection and try again.";
    case "INTERNAL_ERROR":
    default:
      return "Something went wrong in the kitchen. Your Vibe Check is saved, so you can try again.";
  }
}
