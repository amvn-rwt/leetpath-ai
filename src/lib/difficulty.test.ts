import { describe, it, expect } from "vitest";
import { getDifficultyBadgeClass } from "./difficulty";

describe("getDifficultyBadgeClass", () => {
  describe("standalone (default)", () => {
    it("returns emerald classes for EASY", () => {
      const cls = getDifficultyBadgeClass("EASY");
      expect(cls).toContain("rounded-md");
      expect(cls).toContain("border");
      expect(cls).toContain("emerald");
      expect(cls).not.toContain("amber");
      expect(cls).not.toContain("red");
    });

    it("returns emerald classes for easy (case insensitive)", () => {
      const cls = getDifficultyBadgeClass("easy");
      expect(cls).toContain("emerald");
    });

    it("returns amber classes for MEDIUM", () => {
      const cls = getDifficultyBadgeClass("MEDIUM");
      expect(cls).toContain("amber");
      expect(cls).not.toContain("emerald");
      expect(cls).not.toContain("red");
    });

    it("returns red classes for HARD", () => {
      const cls = getDifficultyBadgeClass("HARD");
      expect(cls).toContain("red");
      expect(cls).not.toContain("emerald");
      expect(cls).not.toContain("amber");
    });

    it("returns muted fallback for unknown difficulty", () => {
      const cls = getDifficultyBadgeClass("UNKNOWN");
      expect(cls).toContain("rounded-md");
      expect(cls).toContain("bg-muted");
      expect(cls).toContain("text-muted-foreground");
    });
  });

  describe("inline (Badge)", () => {
    it("returns bg+text only for EASY with inline", () => {
      const cls = getDifficultyBadgeClass("EASY", { inline: true });
      expect(cls).toContain("text-xs");
      expect(cls).toContain("border-0");
      expect(cls).toContain("emerald");
      expect(cls).not.toContain("rounded-md");
    });

    it("returns empty string for unknown difficulty with inline", () => {
      const cls = getDifficultyBadgeClass("UNKNOWN", { inline: true });
      expect(cls).toBe("");
    });
  });
});
