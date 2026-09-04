export type RecipeErrorCode =
  | "INVALID_REQUEST"
  | "CONFIG_ERROR"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_OUTPUT"
  | "INTERNAL_ERROR";

/**
 * A controlled, user-safe error for anything that can go wrong generating a recipe.
 * `message` is written in Mood-to-Menu's own voice and is safe to show directly to the
 * user — never a raw provider message, stack trace, or internal detail. `code` is for
 * frontend/developer branching, not display.
 */
export class RecipeServiceError extends Error {
  readonly code: RecipeErrorCode;
  readonly httpStatus: number;

  constructor(code: RecipeErrorCode, message: string, httpStatus: number) {
    super(message);
    this.name = "RecipeServiceError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const FRIENDLY_MESSAGES: Record<RecipeErrorCode, string> = {
  INVALID_REQUEST: "Let's fine-tune that — pick a mood, add a note, or choose a quick pick, then try again.",
  CONFIG_ERROR: "Something isn't set up right in the kitchen. Please try again shortly.",
  RATE_LIMITED: "The chef is getting lots of orders right now. Please try again shortly.",
  TIMEOUT: "The chef is taking a bit long with that one. Want to try again?",
  PROVIDER_UNAVAILABLE: "The kitchen is a little busy right now. Try again in a moment.",
  INVALID_OUTPUT: "The chef couldn't quite finish that one. Want to try again?",
  INTERNAL_ERROR: "Something went wrong in the kitchen. Please try again.",
};

export function recipeError(code: RecipeErrorCode, httpStatus: number, detail?: string): RecipeServiceError {
  const error = new RecipeServiceError(code, FRIENDLY_MESSAGES[code], httpStatus);
  // `detail` is for server-side logs only (see logger.ts) — never appended to the
  // user-facing message.
  if (detail) error.stack += `\nDetail: ${detail}`;
  return error;
}
