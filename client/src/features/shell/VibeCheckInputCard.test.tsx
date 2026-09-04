import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UseVibeCheckReturn } from "../../hooks/useVibeCheck";
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

  it("shows the mapped friendly message (not the raw backend message) and retries", () => {
    const retry = vi.fn();
    render(
      <VibeCheckInputCard
        vibeCheck={makeVibeCheck({
          phase: "error",
          error: { code: "RATE_LIMITED", message: "raw backend text" },
          canRetry: true,
          retry,
        })}
      />,
    );
    expect(screen.getByText(/lot of orders right now/i)).toBeInTheDocument();
    expect(screen.queryByText("raw backend text")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("Edit Vibe Check calls editVibeCheck from the error state", () => {
    const editVibeCheck = vi.fn();
    render(
      <VibeCheckInputCard
        vibeCheck={makeVibeCheck({
          phase: "error",
          error: { code: "TIMEOUT", message: "raw" },
          editVibeCheck,
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /edit vibe check/i }));
    expect(editVibeCheck).toHaveBeenCalledTimes(1);
  });
});
