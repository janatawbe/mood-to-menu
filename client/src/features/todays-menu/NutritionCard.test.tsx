// Tests the Nutritional Facts card rendering and unit labels.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NutritionCard } from "./NutritionCard";

describe("NutritionCard", () => {
  it("renders nothing when there is no nutrition (an old saved recipe)", () => {
    const { container } = render(<NutritionCard nutrition={undefined} servings={undefined} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Nutritional Facts")).not.toBeInTheDocument();
  });

  it("renders the section heading and 'approximate' framing when nutrition is present", () => {
    render(
      <NutritionCard
        servings={4}
        nutrition={{ calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Nutritional Facts" })).toBeInTheDocument();
    expect(screen.getByText(/approximate values per serving/i)).toBeInTheDocument();
  });

  it("shows the servings count when present", () => {
    render(
      <NutritionCard
        servings={4}
        nutrition={{ calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 }}
      />,
    );
    expect(screen.getByText(/makes 4 servings/i)).toBeInTheDocument();
  });

  it("uses singular 'serving' for a single-serving recipe", () => {
    render(
      <NutritionCard
        servings={1}
        nutrition={{ calories: 400, proteinG: 18, carbohydratesG: 40, fatG: 12, fiberG: 5 }}
      />,
    );
    expect(screen.getByText(/makes 1 serving\b/i)).toBeInTheDocument();
    expect(screen.queryByText(/1 servings/i)).not.toBeInTheDocument();
  });

  it("omits the servings clause entirely when servings is not given", () => {
    render(
      <NutritionCard
        servings={undefined}
        nutrition={{ calories: 400, proteinG: 18, carbohydratesG: 40, fatG: 12, fiberG: 5 }}
      />,
    );
    expect(screen.queryByText(/makes/i)).not.toBeInTheDocument();
  });

  it("renders correct values, units, and labels for all five nutrients", () => {
    render(
      <NutritionCard
        servings={2}
        nutrition={{ calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 }}
      />,
    );

    expect(screen.getByText("520")).toBeInTheDocument();
    expect(screen.getByText("kcal")).toBeInTheDocument();
    expect(screen.getByText("Calories")).toBeInTheDocument();

    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("Protein")).toBeInTheDocument();

    expect(screen.getByText("62")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();

    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Fat")).toBeInTheDocument();

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Fiber")).toBeInTheDocument();

    expect(screen.getAllByText("g")).toHaveLength(4);
  });

  it("rounds fractional nutrition values for display", () => {
    render(
      <NutritionCard
        servings={undefined}
        nutrition={{ calories: 519.6, proteinG: 21.4, carbohydratesG: 61.7, fatG: 19.5, fiberG: 7.6 }}
      />,
    );
    expect(screen.getByText("520")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("62")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("never implies medical or dieting advice", () => {
    render(
      <NutritionCard
        servings={undefined}
        nutrition={{ calories: 520, proteinG: 21, carbohydratesG: 62, fatG: 20, fiberG: 8 }}
      />,
    );
    expect(screen.queryByText(/healthy|unhealthy|good for you|bad for you|diet|lose weight/i)).not.toBeInTheDocument();
  });
});
