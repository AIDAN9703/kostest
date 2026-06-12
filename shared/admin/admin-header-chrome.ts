import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Tailwind class bundles for admin header/sidebar chrome — not theme state.
 * Accent colors come from `admin-theme.css`; these use semantic `primary` tokens.
 */
const ADMIN_THEMED_SURFACE = cn(
  "border-0 shadow-none outline-none",
  "bg-primary/10 dark:bg-primary/25",
  "ring-1 ring-primary/25 dark:ring-2 dark:ring-primary/50",
  "focus:ring-1 focus:ring-primary/25 dark:focus:ring-2 dark:focus:ring-primary/50",
  "focus-visible:ring-1 focus-visible:ring-primary/25 dark:focus-visible:ring-2 dark:focus-visible:ring-primary/50",
  "data-[state=open]:ring-1 data-[state=open]:ring-primary/25 dark:data-[state=open]:ring-2 dark:data-[state=open]:ring-primary/50"
);

/** Shared height/padding for header controls; shorter when sidebar is icon-collapsed (h-12 bar). */
export const adminHeaderControlBase =
  "h-10 min-h-10 px-3 text-sm group-has-data-[collapsible=icon]/sidebar-wrapper:h-9 group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-9";

/** Neutral ring for header icon buttons (mode toggle, etc.). */
export const adminHeaderNeutralChrome =
  "border-0 shadow-none ring-1 ring-border/55 dark:ring-2 dark:ring-white/20";

/** Accent-colored ring for the accent-theme dropdown trigger. */
const ADMIN_THEME_SELECT_CHROME = cn(
  "border-0 bg-transparent shadow-none outline-none",
  "ring-2 ring-primary/45 dark:ring-2 dark:ring-primary/60",
  "focus:ring-2 focus:ring-primary/50 dark:focus:ring-2 dark:focus:ring-primary/65",
  "focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-2 dark:focus-visible:ring-primary/65",
  "data-[state=open]:ring-2 data-[state=open]:ring-primary/50 dark:data-[state=open]:ring-2 dark:data-[state=open]:ring-primary/65"
);

export function adminThemeSelectControl(className?: string) {
  return cn(ADMIN_THEME_SELECT_CHROME, adminHeaderControlBase, "rounded-md", className);
}

/** Sidebar logo / icon frame. */
export function adminThemedSidebarFrame(className?: string) {
  return cn(ADMIN_THEMED_SURFACE, "rounded-lg", className);
}
