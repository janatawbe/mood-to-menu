import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";

/**
 * Single shared Gemini Developer API client for the whole server process. No `vertexai`/
 * `enterprise` flag is set, so this always talks to the Gemini Developer API (never
 * Vertex AI). `env.geminiApiKey` is only ever read here and inside env.ts — this module
 * must never log it.
 *
 * Constructed lazily (on first use) rather than as a module-load-time side effect: ES
 * module imports all resolve before index.ts's own body runs, so a top-level
 * `new GoogleGenAI(...)` would otherwise construct the client (and let the SDK notice a
 * missing key on its own) before `validateEnv()` gets a chance to fail the startup
 * clearly and first, as intended.
 */
let client: GoogleGenAI | undefined;

export function getGeminiClient(): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey: env.geminiApiKey });
  return client;
}
