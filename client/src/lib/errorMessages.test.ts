import { describe, expect, it } from "vitest";
import { getFriendlyErrorMessage } from "./errorMessages";

describe("getFriendlyErrorMessage", () => {
  it("returns a distinct message for RATE_LIMITED", () => {
    expect(getFriendlyErrorMessage("RATE_LIMITED")).toMatch(/lot of orders/i);
  });

  it("returns a distinct message for TIMEOUT", () => {
    expect(getFriendlyErrorMessage("TIMEOUT")).toMatch(/taking longer than expected/i);
  });

  it("returns a distinct message for PROVIDER_UNAVAILABLE", () => {
    expect(getFriendlyErrorMessage("PROVIDER_UNAVAILABLE")).toMatch(/temporarily unavailable/i);
  });

  it("returns a distinct message for INVALID_OUTPUT", () => {
    expect(getFriendlyErrorMessage("INVALID_OUTPUT")).toMatch(/couldn't finish that recipe/i);
  });

  it("returns a message for INVALID_REQUEST that points back at the Vibe Check", () => {
    expect(getFriendlyErrorMessage("INVALID_REQUEST")).toMatch(/vibe check/i);
  });

  it("returns a distinct message for NETWORK_ERROR", () => {
    expect(getFriendlyErrorMessage("NETWORK_ERROR")).toMatch(/couldn't reach the kitchen/i);
  });

  it("returns a dev-safe configuration message for CONFIG_ERROR in development, with no secrets", () => {
    const message = getFriendlyErrorMessage("CONFIG_ERROR", true);
    expect(message).toMatch(/isn't configured correctly/i);
    expect(message).not.toMatch(/GEMINI_API_KEY|AIza/i);
  });

  it("returns a generic safe message for CONFIG_ERROR in production", () => {
    const message = getFriendlyErrorMessage("CONFIG_ERROR", false);
    expect(message).toMatch(/kitchen/i);
    expect(message).not.toMatch(/server|env|configured/i);
  });

  it("falls back to a generic message for INTERNAL_ERROR or an unrecognized code", () => {
    expect(getFriendlyErrorMessage("INTERNAL_ERROR")).toMatch(/went wrong in the kitchen/i);
    expect(getFriendlyErrorMessage("SOMETHING_UNEXPECTED")).toMatch(/went wrong in the kitchen/i);
  });

  it("every message is distinct from every other message", () => {
    const codes = [
      "RATE_LIMITED",
      "TIMEOUT",
      "PROVIDER_UNAVAILABLE",
      "INVALID_OUTPUT",
      "INVALID_REQUEST",
      "NETWORK_ERROR",
      "INTERNAL_ERROR",
    ];
    const messages = codes.map((code) => getFriendlyErrorMessage(code));
    expect(new Set(messages).size).toBe(messages.length);
  });
});
