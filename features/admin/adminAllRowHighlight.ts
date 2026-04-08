/**
 * Admin → All: row highlight keys and styling (persisted on booking / general_inquiry).
 * Edit labels here to match your team's workflow.
 */
export const ADMIN_ALL_HIGHLIGHT_IDS = ["yellow", "green", "blue", "red"] as const;

export type AdminAllHighlightId = (typeof ADMIN_ALL_HIGHLIGHT_IDS)[number];

const HIGHLIGHT_ROW: Record<AdminAllHighlightId, string> = {
  yellow: "bg-amber-100/90 dark:bg-amber-950/40",
  green: "bg-emerald-100/85 dark:bg-emerald-950/35",
  blue: "bg-blue-100/85 dark:bg-blue-950/35",
  red: "bg-red-100/85 dark:bg-red-950/35",
};

const HIGHLIGHT_SWATCH: Record<AdminAllHighlightId, string> = {
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  red: "bg-red-500",
};

/** Short labels for the legend (you can rename to match meaning). */
export const ADMIN_ALL_HIGHLIGHT_LEGEND: Record<AdminAllHighlightId, string> = {
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  red: "Red",
};

export function adminAllHighlightRowClass(
  key: string | null | undefined
): string | undefined {
  if (!key) return undefined;
  return HIGHLIGHT_ROW[key as AdminAllHighlightId] ?? undefined;
}

export function adminAllHighlightSwatchClass(
  key: AdminAllHighlightId
): string {
  return HIGHLIGHT_SWATCH[key];
}

export function isAdminAllHighlightId(v: string): v is AdminAllHighlightId {
  return (ADMIN_ALL_HIGHLIGHT_IDS as readonly string[]).includes(v);
}
