import { describe, expect, it } from "vitest";
import { vibeCheckRequestSchema } from "./vibeCheck.js";

describe("vibeCheckRequestSchema", () => {
  it("accepts a mood-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ selectedMood: "tired" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ selectedMood: "tired", userText: "", quickInputs: [] });
    }
  });

  it("accepts a text-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "I had a long day." });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selectedMood).toBeNull();
      expect(result.data.userText).toBe("I had a long day.");
    }
  });

  it("accepts a chip-only request", () => {
    const result = vibeCheckRequestSchema.safeParse({ quickInputs: ["Long day"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quickInputs).toEqual(["Long day"]);
    }
  });

  it("accepts a combined request", () => {
    const result = vibeCheckRequestSchema.safeParse({
      selectedMood: "cozy",
      userText: "Need something warm.",
      quickInputs: ["Need comfort"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid mood", () => {
    const result = vibeCheckRequestSchema.safeParse({ selectedMood: "furious" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only request with no other signal", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognized quick input", () => {
    const result = vibeCheckRequestSchema.safeParse({ quickInputs: ["Feed me caviar"] });
    expect(result.success).toBe(false);
  });

  it("rejects oversized user text", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "a".repeat(500) });
    expect(result.success).toBe(false);
  });

  it("rejects a completely empty request", () => {
    const result = vibeCheckRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("trims userText before checking for meaningful content", () => {
    const result = vibeCheckRequestSchema.safeParse({ userText: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.userText).toBe("hello");
    }
  });
});
