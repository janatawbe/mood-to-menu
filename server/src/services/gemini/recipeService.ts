import { randomUUID } from "node:crypto";
import { ApiError } from "@google/genai";
import { env } from "../../config/env.js";
import type { Recipe } from "../../types/domain.js";
import type { VibeCheckRequest } from "../../schemas/vibeCheck.js";
import { GEMINI_RECIPE_SCHEMA, recipeContentSchema } from "../../schemas/recipe.js";
import { getGeminiClient } from "./client.js";
import { recipeError, RecipeServiceError } from "./errors.js";
import { logGenerationAttempt, logGenerationFailure, logGenerationStart, logGenerationSuccess } from "./logger.js";
import { buildUserContent, EMPATHETIC_CHEF_SYSTEM_PROMPT } from "./prompt.js";

/** One initial attempt plus one bounded, corrective retry if the first response fails
 * JSON parsing or schema validation. Never retries on provider errors (rate limit,
 * timeout, auth, etc.) — those propagate immediately, since retrying a failing provider
 * call wastes quota without a realistic chance of succeeding differently. */
const MAX_GENERATION_ATTEMPTS = 2;

/** Per-attempt request timeout. Gemini Flash typically responds in a few seconds; this
 * leaves generous headroom before the frontend's own loading state gives up. */
const GEMINI_TIMEOUT_MS = 20_000;

const GENERATION_TEMPERATURE = 0.7;

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Runs one Gemini request and returns the raw response text (or "" if the SDK returned
 * no text — deliberately not thrown here, so an empty body is treated just like invalid
 * JSON by the caller's retry loop below, rather than skipping the bounded retry).
 * Translates any provider failure into a controlled RecipeServiceError; never throws a
 * raw SDK/provider error. */
async function requestGeminiRecipe(input: VibeCheckRequest, correctionNote?: string): Promise<string> {
  const contents = buildUserContent(input, correctionNote);

  let response;
  try {
    response = await getGeminiClient().models.generateContent({
      model: env.geminiModel,
      contents,
      config: {
        systemInstruction: EMPATHETIC_CHEF_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: GEMINI_RECIPE_SCHEMA,
        temperature: GENERATION_TEMPERATURE,
        httpOptions: { timeout: GEMINI_TIMEOUT_MS },
      },
    });
  } catch (err) {
    throw translateProviderError(err);
  }

  return response.text ?? "";
}

function translateProviderError(err: unknown): RecipeServiceError {
  if (err instanceof RecipeServiceError) return err;

  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return recipeError("CONFIG_ERROR", 500, `Gemini auth error (status ${err.status}): ${err.message}`);
    }
    if (err.status === 429) {
      return recipeError("RATE_LIMITED", 429, err.message);
    }
    if (err.status >= 500) {
      return recipeError("PROVIDER_UNAVAILABLE", 503, `Gemini server error (status ${err.status}): ${err.message}`);
    }
    return recipeError("PROVIDER_UNAVAILABLE", 502, `Gemini request error (status ${err.status}): ${err.message}`);
  }

  if (err instanceof Error && (err.name === "AbortError" || /timeout/i.test(err.message))) {
    return recipeError("TIMEOUT", 504, err.message);
  }

  return recipeError("INTERNAL_ERROR", 500, err instanceof Error ? err.message : String(err));
}

/**
 * Generates and validates one recipe for a Vibe Check.
 *
 * initial generation -> validate -> invalid? -> one corrective retry -> validate again
 * -> still invalid? -> controlled INVALID_OUTPUT failure.
 *
 * Provider failures (rate limit, timeout, auth, provider-down) are NOT retried here —
 * they propagate immediately as a RecipeServiceError. Only a malformed/invalid *response
 * body* triggers the single retry, bounded by MAX_GENERATION_ATTEMPTS.
 */
export async function generateRecipe(input: VibeCheckRequest): Promise<Recipe> {
  const startedAt = Date.now();
  logGenerationStart(
    { hasMood: input.selectedMood !== null, hasText: input.userText.length > 0, chipCount: input.quickInputs.length },
    env.geminiModel,
  );

  let correctionNote: string | undefined;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    let rawText: string;
    try {
      rawText = await requestGeminiRecipe(input, correctionNote);
    } catch (err) {
      // Provider errors (rate limit, timeout, auth, provider-down) skip the retry loop
      // entirely and propagate immediately — but still get one failure log line each,
      // so "why did this fail" is never silent in development.
      const failure = err instanceof RecipeServiceError ? err : recipeError("INTERNAL_ERROR", 500, String(err));
      // .stack carries the sanitized technical detail (status code + provider message,
      // never the API key) that recipeError() appends — .message is the user-facing
      // friendly text, which isn't useful in a dev log on its own.
      const detailLine = failure.stack?.split("\nDetail: ")[1];
      logGenerationFailure(Date.now() - startedAt, failure.code, detailLine);
      throw failure;
    }

    const candidate = safeJsonParse(rawText);
    if (candidate === undefined) {
      correctionNote = "the response was not valid JSON";
      logGenerationAttempt(attempt, "invalid_json", correctionNote);
      continue;
    }

    const parsed = recipeContentSchema.safeParse(candidate);
    if (parsed.success) {
      const recipe: Recipe = { id: randomUUID(), ...parsed.data };
      logGenerationSuccess(Date.now() - startedAt, attempt);
      return recipe;
    }

    correctionNote = parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    logGenerationAttempt(attempt, "invalid_schema", correctionNote);
  }

  const failure = recipeError("INVALID_OUTPUT", 502, correctionNote);
  logGenerationFailure(Date.now() - startedAt, failure.code, correctionNote);
  throw failure;
}
