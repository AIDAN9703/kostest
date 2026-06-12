import { cn } from "@/shared/lib/utils/general-utils";

import {
  type AdminAccentTheme,
  normalizeAdminAccentTheme,
} from "./admin-accent-theme.config";

/** Classes that scope admin CSS variables + accent preset onto an element (for portaled UI). */
export function adminShellClassName(activeTheme?: AdminAccentTheme | string) {
  const theme = normalizeAdminAccentTheme(activeTheme);
  return cn("admin-theme", `theme-${theme}`);
}

/** Read the active accent from the live admin root (client-only). */
export function readAdminAccentFromDom(): AdminAccentTheme | null {
  if (typeof document === "undefined") return null;

  const root = document.querySelector("[data-admin-theme]");
  if (!root) return null;

  const themeClass = Array.from(root.classList).find((className) =>
    className.startsWith("theme-")
  );

  return normalizeAdminAccentTheme(themeClass?.replace("theme-", ""));
}
