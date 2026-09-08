// Tests the loading-state chef line copy.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingChefLine } from "./LoadingChefLine";

const EXPECTED_LINES = ["Thinking up something good…", "Putting your mood on the menu…", "Almost plating it…"];

describe("LoadingChefLine", () => {
  it("renders one of the known short loading lines", () => {
    render(<LoadingChefLine />);
    const text = screen.getByText((_, element) => element?.tagName === "P" && EXPECTED_LINES.includes(element.textContent ?? ""));
    expect(text).toBeInTheDocument();
  });

  it("never implies a fake progress percentage", () => {
    render(<LoadingChefLine />);
    for (const line of EXPECTED_LINES) {
      expect(line).not.toMatch(/%|percent/i);
    }
  });
});
