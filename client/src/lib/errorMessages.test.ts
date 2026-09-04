import { describe, expect, it } from "vitest";
import { getFriendlyErrorMessage, getRecipeErrorCopy } from "./errorMessages";

describe("getRecipeErrorCopy", () => {
  it("RATE_LIMITED", () => {
    expect(getRecipeErrorCopy("RATE_LIMITED")).toEqual({
      title: "The kitchen is handling too many orders right now.",
      message: "You've hit the current AI request limit. Wait a little and try again.",
    });
  });

  it("TIMEOUT (also used for a Gemini 504 DEADLINE_EXCEEDED)", () => {
    expect(getRecipeErrorCopy("TIMEOUT")).toEqual({
      title: "This recipe took too long.",
      message:
        "The AI didn't finish before the request timed out. Your Vibe Check is still saved, so you can try again.",
    });
  });

  it("PROVIDER_UNAVAILABLE (also used for a Gemini 503 high-demand error)", () => {
    expect(getRecipeErrorCopy("PROVIDER_UNAVAILABLE")).toEqual({
      title: "The AI service is temporarily unavailable.",
      message: "Gemini is currently unavailable or under heavy demand. Try again in a few moments.",
    });
  });

  it("INVALID_OUTPUT", () => {
    expect(getRecipeErrorCopy("INVALID_OUTPUT")).toEqual({
      title: "The recipe came back incomplete.",
      message: "The AI returned a response that didn't match the recipe format we need. Try generating it again.",
    });
  });

  it("INVALID_REQUEST", () => {
    expect(getRecipeErrorCopy("INVALID_REQUEST")).toEqual({
      title: "Your Vibe Check needs a small fix.",
      message: "Please make sure you've selected a mood, entered some text, or chosen at least one quick option.",
    });
  });

  it("CONFIG_ERROR in development names the real cause, with no secrets", () => {
    const copy = getRecipeErrorCopy("CONFIG_ERROR", true);
    expect(copy).toEqual({
      title: "The recipe service isn't configured correctly.",
      message: "The backend is missing or misconfigured for the Gemini connection. Check the server environment setup.",
    });
    expect(copy.title + copy.message).not.toMatch(/GEMINI_API_KEY|AIza/i);
  });

  it("CONFIG_ERROR in production stays generic", () => {
    expect(getRecipeErrorCopy("CONFIG_ERROR", false)).toEqual({
      title: "The recipe service is temporarily unavailable.",
      message: "There's a server configuration problem right now. Please try again later.",
    });
  });

  it("NETWORK_ERROR (Express itself unreachable)", () => {
    expect(getRecipeErrorCopy("NETWORK_ERROR")).toEqual({
      title: "I couldn't reach the kitchen.",
      message: "The app couldn't connect to the recipe server. Check that the backend is running and try again.",
    });
  });

  it("INTERNAL_ERROR", () => {
    expect(getRecipeErrorCopy("INTERNAL_ERROR")).toEqual({
      title: "Something went wrong in the kitchen.",
      message: "An unexpected server error occurred. Your Vibe Check is still saved, so you can try again.",
    });
  });

  it("falls back to the INTERNAL_ERROR copy for an unrecognized code", () => {
    expect(getRecipeErrorCopy("SOMETHING_UNEXPECTED")).toEqual(getRecipeErrorCopy("INTERNAL_ERROR"));
  });

  it("every code (including both CONFIG_ERROR variants) has a distinct title and message", () => {
    const codes = [
      "RATE_LIMITED",
      "TIMEOUT",
      "PROVIDER_UNAVAILABLE",
      "INVALID_OUTPUT",
      "INVALID_REQUEST",
      "NETWORK_ERROR",
      "INTERNAL_ERROR",
    ];
    const copies = [
      ...codes.map((code) => getRecipeErrorCopy(code)),
      getRecipeErrorCopy("CONFIG_ERROR", true),
      getRecipeErrorCopy("CONFIG_ERROR", false),
    ];
    const titles = copies.map((c) => c.title);
    const messages = copies.map((c) => c.message);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(messages).size).toBe(messages.length);
  });
});

describe("getFriendlyErrorMessage", () => {
  it("returns just the message half of the same copy", () => {
    expect(getFriendlyErrorMessage("RATE_LIMITED")).toBe(getRecipeErrorCopy("RATE_LIMITED").message);
    expect(getFriendlyErrorMessage("CONFIG_ERROR", true)).toBe(getRecipeErrorCopy("CONFIG_ERROR", true).message);
  });
});
