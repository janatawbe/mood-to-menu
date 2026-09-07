import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoodFilterPicker } from "./MoodFilterPicker";

describe("MoodFilterPicker", () => {
  it("shows 'All moods' on the trigger by default", () => {
    render(<MoodFilterPicker mood="all" onMoodChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /all moods/i })).toBeInTheDocument();
  });

  it("shows the currently selected mood's label on the trigger", () => {
    render(<MoodFilterPicker mood="cozy" onMoodChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /cozy/i })).toBeInTheDocument();
  });

  it("is closed by default and has the correct ARIA attributes", () => {
    render(<MoodFilterPicker mood="all" onMoodChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /all moods/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens on click and lists all 7 mood options", () => {
    render(<MoodFilterPicker mood="all" onMoodChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all moods/i }));

    const listbox = screen.getByRole("listbox", { name: /filter by mood/i });
    const options = within(listbox).getAllByRole("option");
    expect(options).toHaveLength(7);
    expect(within(listbox).getByRole("option", { name: /all moods/i })).toBeInTheDocument();
    for (const label of ["Calm", "Stressed", "Tired", "Happy", "Energetic", "Cozy"]) {
      expect(within(listbox).getByRole("option", { name: new RegExp(label, "i") })).toBeInTheDocument();
    }
  });

  it("marks the currently selected mood as aria-selected", () => {
    render(<MoodFilterPicker mood="stressed" onMoodChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /stressed/i }));

    expect(screen.getByRole("option", { name: /stressed/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /all moods/i })).toHaveAttribute("aria-selected", "false");
  });

  it("clicking an option calls onMoodChange and closes the menu", () => {
    const onMoodChange = vi.fn();
    render(<MoodFilterPicker mood="all" onMoodChange={onMoodChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all moods/i }));

    fireEvent.click(screen.getByRole("option", { name: /^happy$/i }));

    expect(onMoodChange).toHaveBeenCalledWith("happy");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Escape closes the menu without calling onMoodChange", () => {
    const onMoodChange = vi.fn();
    render(<MoodFilterPicker mood="all" onMoodChange={onMoodChange} />);
    const trigger = screen.getByRole("button", { name: /all moods/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onMoodChange).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("clicking outside the menu closes it without calling onMoodChange", () => {
    const onMoodChange = vi.fn();
    render(<MoodFilterPicker mood="all" onMoodChange={onMoodChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all moods/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onMoodChange).not.toHaveBeenCalled();
  });

  it("ArrowDown on the trigger opens the menu", () => {
    render(<MoodFilterPicker mood="all" onMoodChange={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /all moods/i }), { key: "ArrowDown" });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("ArrowDown then Enter on the listbox selects the next option", () => {
    const onMoodChange = vi.fn();
    render(<MoodFilterPicker mood="all" onMoodChange={onMoodChange} />);
    fireEvent.click(screen.getByRole("button", { name: /all moods/i }));

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" }); // moves from "All moods" to "Calm"
    fireEvent.keyDown(listbox, { key: "Enter" });

    expect(onMoodChange).toHaveBeenCalledWith("calm");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Tab closes the menu", () => {
    render(<MoodFilterPicker mood="all" onMoodChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /all moods/i }));

    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Tab" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
