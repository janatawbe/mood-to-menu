import { beforeEach, describe, expect, it, vi } from "vitest";

describe("validateEnv", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("throws a clear error when GEMINI_API_KEY is missing, without printing a value", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const { validateEnv } = await import("./env.js");

    expect(() => validateEnv()).toThrow(/GEMINI_API_KEY/);
  });

  it("does not throw when GEMINI_API_KEY is present", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-placeholder-key");
    const { validateEnv } = await import("./env.js");

    expect(() => validateEnv()).not.toThrow();
  });
});
