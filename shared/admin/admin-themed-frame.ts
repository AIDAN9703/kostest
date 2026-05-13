import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Shared admin chrome (sidebar logo, theme selector, search, etc.):
 * - Light: `primary/10` fill + `ring-1 primary/25` reads well on white.
 * - Dark: the same relative opacities disappear on near-black (10% of a mid LC primary
 *   blends into ~black). We bump fill + ring opacity and use a slightly thicker ring
 *   so hue and edge read like light mode — not a separate "rings only" design.
 */
const ADMIN_THEMED_SURFACE = cn(
  "border-0 shadow-none outline-none",
  "bg-primary/10 dark:bg-primary/25",
  "ring-1 ring-primary/25 dark:ring-2 dark:ring-primary/50",
  "focus:ring-1 focus:ring-primary/25 dark:focus:ring-2 dark:focus:ring-primary/50",
  "focus-visible:ring-1 focus-visible:ring-primary/25 dark:focus-visible:ring-2 dark:focus-visible:ring-primary/50",
  "data-[state=open]:ring-1 data-[state=open]:ring-primary/25 dark:data-[state=open]:ring-2 dark:data-[state=open]:ring-primary/50"
);

/** One shared row height + padding for admin header search + theme select. */
export const adminHeaderControlBase = "h-10 min-h-10 px-3 text-sm";

/**
 * Neutral ring matching the theme selector's ring width (light: ring-1, dark: ring-2) so the
 * painted outline extends the same distance outside the box — borders sit inside h-10 and look "short".
 */
export const adminHeaderNeutralChrome =
  "border-0 shadow-none ring-1 ring-border/55 dark:ring-2 dark:ring-white/20";

export function adminThemedControl(className?: string) {
  return cn(ADMIN_THEMED_SURFACE, adminHeaderControlBase, "rounded-md", className);
}

/** Sidebar logo / icon frame (same token depth, rounded-lg). */
export function adminThemedSidebarFrame(className?: string) {
  return cn(ADMIN_THEMED_SURFACE, "rounded-lg", className);
}
