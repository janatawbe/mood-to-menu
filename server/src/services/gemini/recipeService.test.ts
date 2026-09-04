import { ApiError } from "@google/genai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VibeCheckRequest } from "../../schemas/vibeCheck.js";

const generateContentMock = vi.fn();

// Mocks the Gemini SDK boundary only — everything else in the service (prompt
// building, JSON parsing, zod validation, retry logic, error translation) runs for
// real. No automated test in this suite makes a live Gemini request.
vi.mock("./client.js", () => ({
  getGeminiClient: () => ({
    models: {
      generateContent: (...args: unknown[]) => generateContentMock(...args),
    },
  }),
}));

const { generateRecipe } = await import("./recipeService.js");
const { RecipeServiceError } = await import("./errors.js");

const INPUT: VibeCheckRequest = { selectedMood: "tired", userText: "Long day.", quickInputs: [] };

function validRecipeJson(): string {
  return JSON.stringify({
    detectedMood: "tired",
    mealIntent: { prepEffort: "low", style: "comforting" },
    dishName: "Creamy Chicken Rice Bowl",
    reasoning: "A warm, low-effort meal for a day when cooking feels like too much.",
    ingredients: [{ name: "Chicken breast", amount: "200 g" }],
    instructions: ["Cook the rice.", "Prepare the chicken."],
    prepTime: "20 min",
    tags: ["Comforting", "Quick"],
    chefTip: "Use pre-cooked rice to save time.",
  });
}

beforeEach(() => {
  generateContentMock.mockReset();
});

describe("generateRecipe", () => {
  it("returns a validated recipe on a valid first response", async () => {
    generateContentMock.mockResolvedValueOnce({ text: validRecipeJson() });

    const recipe = await generateRecipe(INPUT);

    expect(recipe.dishName).toBe("Creamy Chicken Rice Bowl");
    expect(recipe.id).toBeTruthy();
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("recovers with one retry when the first response is invalid JSON", async () => {
    generateContentMock
      .mockResolvedValueOnce({ text: "not valid json{{" })
      .mockResolvedValueOnce({ text: validRecipeJson() });

    const recipe = await generateRecipe(INPUT);

    expect(recipe.dishName).toBe("Creamy Chicken Rice Bowl");
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it("recovers with one retry when the first response fails schema validation", async () => {
    generateContentMock
      .mockResolvedValueOnce({ text: JSON.stringify({ dishName: "Missing everything else" }) })
      .mockResolvedValueOnce({ text: validRecipeJson() });

    const recipe = await generateRecipe(INPUT);

    expect(recipe.dishName).toBe("Creamy Chicken Rice Bowl");
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it("fails with a bounded INVALID_OUTPUT error when both attempts are invalid", async () => {
    generateContentMock.mockResolvedValue({ text: "still not json" });

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "INVALID_OUTPUT" });
    // Exactly two attempts — proves the retry is bounded, not an infinite/unbounded loop.
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it("propagates a rate-limit error immediately, without retrying", async () => {
    generateContentMock.mockRejectedValueOnce(new ApiError({ message: "Too many requests", status: 429 }));

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "RATE_LIMITED", httpStatus: 429 });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("propagates a 503 UNAVAILABLE (high demand) error as PROVIDER_UNAVAILABLE, without retrying", async () => {
    generateContentMock.mockRejectedValueOnce(
      new ApiError({
        message: "This model is currently experiencing high demand. Spikes in demand are usually temporary.",
        status: 503,
      }),
    );

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE", httpStatus: 503 });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("propagates a 504 DEADLINE_EXCEEDED error as TIMEOUT (not PROVIDER_UNAVAILABLE), without retrying", async () => {
    generateContentMock.mockRejectedValueOnce(new ApiError({ message: "Deadline exceeded", status: 504 }));

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "TIMEOUT", httpStatus: 504 });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("other 5xx provider errors still fall back to PROVIDER_UNAVAILABLE, without retrying", async () => {
    generateContentMock.mockRejectedValueOnce(new ApiError({ message: "Internal error", status: 500 }));

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("propagates an auth error as CONFIG_ERROR, without leaking details in the message", async () => {
    generateContentMock.mockRejectedValueOnce(new ApiError({ message: "API key not valid", status: 401 }));

    const failure = await generateRecipe(INPUT).catch((err: unknown) => err);
    expect(failure).toBeInstanceOf(RecipeServiceError);
    expect((failure as InstanceType<typeof RecipeServiceError>).code).toBe("CONFIG_ERROR");
    expect((failure as Error).message).not.toContain("API key not valid");
  });

  it("propagates a timeout/abort as TIMEOUT, without retrying", async () => {
    generateContentMock.mockRejectedValueOnce(new DOMException("The operation was aborted.", "AbortError"));

    await expect(generateRecipe(INPUT)).rejects.toMatchObject({ code: "TIMEOUT" });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("treats an empty response body as invalid output and still retries once", async () => {
    generateContentMock.mockResolvedValueOnce({ text: undefined }).mockResolvedValueOnce({ text: validRecipeJson() });

    const recipe = await generateRecipe(INPUT);

    expect(recipe.dishName).toBe("Creamy Chicken Rice Bowl");
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });
});
