import type { RecipeErrorCode } from "../services/api";

export interface RecipeErrorCopy {
  title: string;
  message: string;
}

/**
 * Frontend-owned copy for every recipe-generation error code, so the user always learns
 * WHAT kind of problem happened — never a raw provider/Gemini message, payload, stack
 * trace, or API key, which the backend never sends us anyway (see
 * server/src/services/gemini/errors.ts). Keyed on `code` alone; `error.message` from the
 * API layer is intentionally never shown to the user.
 */
const COPY: Record<Exclude<RecipeErrorCode, "CONFIG_ERROR">, RecipeErrorCopy> = {
  RATE_LIMITED: {
    title: "The kitchen is handling too many orders right now.",
    message: "You've hit the current AI request limit. Wait a little and try again.",
  },
  TIMEOUT: {
    title: "This recipe took too long.",
    message: "The AI didn't finish before the request timed out. Your Vibe Check is still saved, so you can try again.",
  },
  PROVIDER_UNAVAILABLE: {
    title: "The AI service is temporarily unavailable.",
    message: "Gemini is currently unavailable or under heavy demand. Try again in a few moments.",
  },
  INVALID_OUTPUT: {
    title: "The recipe came back incomplete.",
    message: "The AI returned a response that didn't match the recipe format we need. Try generating it again.",
  },
  INVALID_REQUEST: {
    title: "Your Vibe Check needs a small fix.",
    message: "Please make sure you've selected a mood, entered some text, or chosen at least one quick option.",
  },
  NETWORK_ERROR: {
    title: "I couldn't reach the kitchen.",
    message: "The app couldn't connect to the recipe server. Check that the backend is running and try again.",
  },
  INTERNAL_ERROR: {
    title: "Something went wrong in the kitchen.",
    message: "An unexpected server error occurred. Your Vibe Check is still saved, so you can try again.",
  },
};

const CONFIG_ERROR_DEV: RecipeErrorCopy = {
  title: "The recipe service isn't configured correctly.",
  message: "The backend is missing or misconfigured for the Gemini connection. Check the server environment setup.",
};

const CONFIG_ERROR_PROD: RecipeErrorCopy = {
  title: "The recipe service is temporarily unavailable.",
  message: "There's a server configuration problem right now. Please try again later.",
};

/**
 * `isDev` defaults to the real Vite dev flag but is an explicit parameter so it's easy
 * to test both CONFIG_ERROR branches without stubbing `import.meta.env`. An unrecognized
 * `code` (a future backend error type) falls back to the generic INTERNAL_ERROR copy
 * rather than rendering nothing.
 */
export function getRecipeErrorCopy(code: string, isDev: boolean = import.meta.env.DEV): RecipeErrorCopy {
  if ((code as RecipeErrorCode) === "CONFIG_ERROR") {
    return isDev ? CONFIG_ERROR_DEV : CONFIG_ERROR_PROD;
  }
  return COPY[code as Exclude<RecipeErrorCode, "CONFIG_ERROR">] ?? COPY.INTERNAL_ERROR;
}

/** Message-only accessor for spots that show just one line (e.g. the compact Today's
 * Menu regenerate banner) rather than the full title+message error state. */
export function getFriendlyErrorMessage(code: string, isDev: boolean = import.meta.env.DEV): string {
  return getRecipeErrorCopy(code, isDev).message;
}
