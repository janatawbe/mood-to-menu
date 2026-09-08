import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChefMascot } from "./ChefMascot";

describe("ChefMascot", () => {
  it("reserves its footprint and shows no speech bubble before arriving", () => {
    render(<ChefMascot arrived={false} />);
    expect(screen.queryByText(/ready to help/i)).not.toBeInTheDocument();
  });

  it("shows the default 'Ready to help!' message on the Vibe Check section", () => {
    render(<ChefMascot arrived status="welcoming" section="vibe-check" />);
    expect(screen.getByText("Ready to help!")).toBeInTheDocument();
  });

  it("shows the default message when no section is given", () => {
    render(<ChefMascot arrived status="welcoming" />);
    expect(screen.getByText("Ready to help!")).toBeInTheDocument();
  });

  it("shows a section-specific idle message for each of the other sections", () => {
    const cases: Array<[string, string]> = [
      ["todays-menu", "Let's cook!"],
      ["grocery-list", "Need anything?"],
      ["taste-memory", "I'll remember!"],
      ["favorites", "Best picks here!"],
      ["recipe-history", "A tasty trail."],
    ];
    for (const [section, expected] of cases) {
      const { unmount } = render(<ChefMascot arrived status="welcoming" section={section as never} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    }
  });

  it("no longer has a Chef's Tips section-message entry (the sidebar section was removed)", () => {
    // Regression guard distinguishing the two different "chef tip" concepts: the
    // sidebar's "Chef's Tips" nav section is gone, but this test only concerns the
    // idle sidebar bubble — the per-recipe `chefTip` field/ChefTipCard is unrelated
    // and unaffected (see RecipeReveal.test.tsx for that).
    render(<ChefMascot arrived status="welcoming" section={"chefs-tips" as never} />);
    expect(screen.queryByText("More soon!")).not.toBeInTheDocument();
    expect(screen.getByText("Ready to help!")).toBeInTheDocument();
  });

  it("shows 'Cooking...' while cooking, regardless of section", () => {
    render(<ChefMascot arrived status="cooking" section="grocery-list" />);
    expect(screen.getByText("Cooking...")).toBeInTheDocument();
    expect(screen.queryByText("Need anything?")).not.toBeInTheDocument();
  });

  it("shows 'Bon appétit!' when served, regardless of section", () => {
    render(<ChefMascot arrived status="served" mood="cozy" section="todays-menu" />);
    expect(screen.getByText("Bon appétit!")).toBeInTheDocument();
    expect(screen.queryByText("Let's cook!")).not.toBeInTheDocument();
  });

  it("ignores the section message while attentive (a mood is selected)", () => {
    render(<ChefMascot arrived status="attentive" mood="happy" section="grocery-list" />);
    expect(screen.queryByText("Need anything?")).not.toBeInTheDocument();
    expect(screen.getByText("Ready to help!")).toBeInTheDocument();
  });
});
