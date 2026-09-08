import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SuccessSparkle } from "./SuccessSparkle";

describe("SuccessSparkle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when inactive (a reopened recipe)", () => {
    render(<SuccessSparkle active={false} />);
    expect(screen.queryByRole("status", { name: /freshly made/i })).not.toBeInTheDocument();
  });

  it("renders the celebration when active (a fresh generation)", () => {
    render(<SuccessSparkle active />);
    expect(screen.getByRole("status", { name: /freshly made/i })).toBeInTheDocument();
  });

  it("hides itself again after a short delay, without needing to be told to", () => {
    render(<SuccessSparkle active />);
    expect(screen.getByRole("status", { name: /freshly made/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole("status", { name: /freshly made/i })).not.toBeInTheDocument();
  });
});
