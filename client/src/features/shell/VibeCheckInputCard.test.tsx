import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseVibeCheckReturn, VibeCheckError } from "../../hooks/useVibeCheck";
import { getRecipeErrorCopy } from "../../lib/errorMessages";
import { VibeCheckInputCard } from "./VibeCheckInputCard";

function makeVibeCheck(overrides: Partial<UseVibeCheckReturn> = {}): UseVibeCheckReturn {
  return {
    vibeCheck: { selectedMood: null, userText: "", quickInputs: [] },
    selectedMood: null,
    userText: "",
    quickInputs: [],
    phase: "idle",
    recipe: null,
    error: null,
    isRegenerating: false,
    regenerateError: null,
    hasMeaningfulText: false,
    canSubmit: false,
    canRetry: false,
    canRegenerate: false,
    toggleMood: vi.fn(),
    setUserText: vi.fn(),
    toggleQuickInput: vi.fn(),
    submit: vi.fn(),
    retry: vi.fn(),
    regenerate: vi.fn(),
    editVibeCheck: vi.fn(),
    ...overrides,
  };
}

function renderError(error: VibeCheckError, overrides: Partial<UseVibeCheckReturn> = {}) {
  return render(<VibeCheckInputCard vibeCheck={makeVibeCheck({ phase: "error", error, ...overrides })} />);
}

describe("VibeCheckInputCard", () => {
  it("shows the editable form with no dev/debug content when idle", () => {
    render(<VibeCheckInputCard vibeCheck={makeVibeCheck()} />);
    expect(screen.getByLabelText(/tell me more about your day/i)).toBeInTheDocument();
    expect(screen.queryByText(/\[DEV\]/i)).not.toBeInTheDocument();
  });

  it("shows the same editable form (not a recipe summary) when captured", () => {
    render(<VibeCheckInputCard vibeCheck={makeVibeCheck({ phase: "captured" })} />);
    expect(screen.getByLabelText(/tell me more about your day/i)).toBeInTheDocument();
    expect(screen.queryByText(/is ready!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\[DEV\]/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recipe received from/i)).not.toBeInTheDocument();
  });

  it("Try again retries the exact same request", () => {
    const retry = vi.fn();
    renderError({ code: "RATE_LIMITED", message: "raw backend text" }, { canRetry: true, retry });

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("Edit Vibe Check calls editVibeCheck from the error state", () => {
    const editVibeCheck = vi.fn();
    renderError({ code: "TIMEOUT", message: "raw" }, { editVibeCheck });

    fireEvent.click(screen.getByRole("button", { name: /edit vibe check/i }));
    expect(editVibeCheck).toHaveBeenCalledTimes(1);
  });

  const codes: VibeCheckError["code"][] = [
    "RATE_LIMITED",
    "TIMEOUT",
    "PROVIDER_UNAVAILABLE",
    "INVALID_OUTPUT",
    "INVALID_REQUEST",
    "CONFIG_ERROR",
    "NETWORK_ERROR",
    "INTERNAL_ERROR",
    "SOME_UNRECOGNIZED_CODE",
  ];

  it.each(codes)("shows the exact title and message for %s, never the raw backend message", (code) => {
    renderError({ code, message: "raw backend text that must never render" });

    const expected = getRecipeErrorCopy(code);
    expect(screen.getByText(expected.title)).toBeInTheDocument();
    expect(screen.getByText(expected.message)).toBeInTheDocument();
    expect(screen.queryByText("raw backend text that must never render")).not.toBeInTheDocument();
    // The old one-size-fits-all title must never appear for any code.
    expect(screen.queryByText("Hmm, that didn't work.")).not.toBeInTheDocument();
  });

  it("never shows one error code's title/message for a different code", () => {
    renderError({ code: "TIMEOUT", message: "raw" });

    const rateLimited = getRecipeErrorCopy("RATE_LIMITED");
    const providerUnavailable = getRecipeErrorCopy("PROVIDER_UNAVAILABLE");
    expect(screen.queryByText(rateLimited.title)).not.toBeInTheDocument();
    expect(screen.queryByText(providerUnavailable.title)).not.toBeInTheDocument();
    expect(screen.queryByText(providerUnavailable.message)).not.toBeInTheDocument();
  });
});
