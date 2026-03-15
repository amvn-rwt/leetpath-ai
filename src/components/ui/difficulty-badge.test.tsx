import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { getDifficultyBadgeClass } from "@/lib/difficulty";

function DifficultyBadge({
  difficulty,
  inline = false,
}: {
  difficulty: string;
  inline?: boolean;
}) {
  return (
    <span
      className={getDifficultyBadgeClass(difficulty, inline ? { inline: true } : undefined)}
      data-testid="difficulty-badge"
    >
      {difficulty}
    </span>
  );
}

describe("DifficultyBadge (integration)", () => {
  it("renders EASY with correct class and text", () => {
    render(<DifficultyBadge difficulty="EASY" />);
    const el = screen.getByTestId("difficulty-badge");
    expect(el).toHaveTextContent("EASY");
    expect(el.className).toContain("emerald");
  });

  it("renders HARD with red styling", () => {
    render(<DifficultyBadge difficulty="HARD" />);
    const el = screen.getByTestId("difficulty-badge");
    expect(el.className).toContain("red");
  });

  it("inline variant omits rounded-md", () => {
    render(<DifficultyBadge difficulty="MEDIUM" inline />);
    const el = screen.getByTestId("difficulty-badge");
    expect(el.className).toContain("amber");
    expect(el.className).not.toContain("rounded-md");
  });
});
