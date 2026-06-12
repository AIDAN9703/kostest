/** Accent color presets for the admin shell (independent of light/dark mode). */
export const ADMIN_ACCENT_THEMES = ["default", "gold", "blue", "amber"] as const;
export type AdminAccentTheme = (typeof ADMIN_ACCENT_THEMES)[number];

export const ADMIN_ACCENT_THEME_COOKIE = "admin_active_theme";

export const ADMIN_ACCENT_THEME_OPTIONS: ReadonlyArray<{
  name: string;
  value: AdminAccentTheme;
}> = [
  { name: "Default", value: "default" },
  { name: "Gold", value: "gold" },
  { name: "Blue", value: "blue" },
  { name: "Amber", value: "amber" },
];

export function normalizeAdminAccentTheme(
  theme: string | undefined
): AdminAccentTheme {
  if (theme && (ADMIN_ACCENT_THEMES as readonly string[]).includes(theme)) {
    return theme as AdminAccentTheme;
  }
  return "default";
}
