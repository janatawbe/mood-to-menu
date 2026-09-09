// Tests usePublicRecipes' loading/success/error states against a mocked fetch.
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePublicRecipes } from "./usePublicRecipes";

const validEntry = {
  id: "r1",
  dishName: "Root Vegetable Stew",
  detectedMood: "cozy",
  mealIntent: { prepEffort: "medium", style: "hearty" },
  ingredients: [{ name: "Carrots", amount: "3 large" }],
  instructions: ["Chop.", "Simmer."],
  prepTime: "50 min",
  tags: ["Hearty"],
  chefTip: "Add a splash of vinegar before serving.",
  servings: 4,
  nutrition: { calories: 420, proteinG: 12, carbohydratesG: 55, fatG: 14, fiberG: 9 },
  generatedAt: "2026-01-01T00:00:00.000Z",
};

function mockFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ recipes: [] }), ...response } as Response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePublicRecipes", () => {
  it("starts in loading, then moves to success with the fetched recipes", async () => {
    mockFetchOnce({ ok: true, json: async () => ({ recipes: [validEntry] }) });

    const { result } = renderHook(() => usePublicRecipes());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.recipes).toHaveLength(1);
    expect(result.current.recipes[0]?.dishName).toBe("Root Vegetable Stew");
  });

  it("resolves to success with an empty list when there are no public recipes yet", async () => {
    mockFetchOnce({ ok: true, json: async () => ({ recipes: [] }) });

    const { result } = renderHook(() => usePublicRecipes());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.recipes).toEqual([]);
  });

  it("moves to error on a non-ok response, without throwing", async () => {
    mockFetchOnce({ ok: false, json: async () => ({}) });

    const { result } = renderHook(() => usePublicRecipes());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBeTruthy();
    expect(result.current.recipes).toEqual([]);
  });

  it("moves to error when fetch itself rejects (network failure)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { result } = renderHook(() => usePublicRecipes());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorMessage).toBeTruthy();
  });

  it("drops an individually invalid entry rather than failing the whole feed", async () => {
    mockFetchOnce({ ok: true, json: async () => ({ recipes: [validEntry, { id: "bad" }] }) });

    const { result } = renderHook(() => usePublicRecipes());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.recipes).toHaveLength(1);
  });

  it("refetch re-runs the fetch and can recover from a prior error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recipes: [validEntry] }) } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePublicRecipes());
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.recipes).toHaveLength(1);
  });
});
