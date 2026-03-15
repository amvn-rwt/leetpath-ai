/**
 * Tailwind class for difficulty badges.
 * - Default: use for a standalone <span> (includes border, rounded, padding).
 * - inline: true: use as className on a Badge component (bg + text only).
 */
export function getDifficultyBadgeClass(
  difficulty: string,
  options?: { inline?: boolean }
): string {
  const d = difficulty.toUpperCase();
  const standalone = {
    EASY:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    MEDIUM:
      "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    HARD:
      "border-red-500/40 bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  };
  const inlineOnly = {
    EASY:
      "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    MEDIUM:
      "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    HARD:
      "bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  };

  if (options?.inline) {
    const base =
      d === "EASY"
        ? inlineOnly.EASY
        : d === "MEDIUM"
          ? inlineOnly.MEDIUM
          : d === "HARD"
            ? inlineOnly.HARD
            : "";
    return base ? `text-xs border-0 ${base}` : "";
  }

  const base =
    d === "EASY"
      ? standalone.EASY
      : d === "MEDIUM"
        ? standalone.MEDIUM
        : d === "HARD"
          ? standalone.HARD
          : "border-border bg-muted text-muted-foreground";
  return `rounded-md border px-2 py-0.5 text-xs font-medium ${base}`;
}
