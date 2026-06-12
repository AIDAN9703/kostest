"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { adminShellClassName } from "@/shared/admin/admin-shell-classes";
import { adminThemeSelectControl } from "@/shared/admin/admin-header-chrome";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils/general-utils";

import {
  ADMIN_ACCENT_THEME_COOKIE,
  ADMIN_ACCENT_THEME_OPTIONS,
  type AdminAccentTheme,
  normalizeAdminAccentTheme,
} from "./admin-accent-theme.config";

export {
  ADMIN_ACCENT_THEMES,
  ADMIN_ACCENT_THEME_COOKIE,
  type AdminAccentTheme,
  normalizeAdminAccentTheme,
} from "./admin-accent-theme.config";

function setAccentThemeCookie(theme: string) {
  if (typeof window === "undefined") return;

  document.cookie = `${ADMIN_ACCENT_THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === "https:" ? "Secure;" : ""
  }`;
}

type AccentThemeContextValue = {
  activeTheme: AdminAccentTheme;
  setActiveTheme: (theme: AdminAccentTheme) => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | undefined>(
  undefined
);

export function AdminAccentThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<AdminAccentTheme>(() =>
    normalizeAdminAccentTheme(initialTheme)
  );

  useEffect(() => {
    setAccentThemeCookie(activeTheme);

    const root = document.querySelector("[data-admin-theme]");
    if (!root) return;

    Array.from(root.classList)
      .filter((className) => className.startsWith("theme-"))
      .forEach((className) => root.classList.remove(className));
    root.classList.add(`theme-${activeTheme}`);
  }, [activeTheme]);

  return (
    <AccentThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </AccentThemeContext.Provider>
  );
}

export function useAdminAccentTheme() {
  const context = useContext(AccentThemeContext);

  if (!context) {
    throw new Error(
      "useAdminAccentTheme must be used within AdminAccentThemeProvider"
    );
  }

  return context;
}

/** Header dropdown for accent color (not light/dark — see ModeToggle). */
export function AdminAccentThemeSelector() {
  const { activeTheme, setActiveTheme } = useAdminAccentTheme();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Label htmlFor="admin-accent-theme" className="sr-only">
        Accent theme
      </Label>
      <Select
        value={activeTheme}
        onValueChange={(value) => setActiveTheme(value as AdminAccentTheme)}
      >
        <SelectTrigger
          id="admin-accent-theme"
          className={cn(
            adminThemeSelectControl(),
            "justify-start gap-2",
            "*:data-[slot=select-value]:w-12"
          )}
        >
          <span className="hidden text-muted-foreground sm:block">Theme:</span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end" className={adminShellClassName(activeTheme)}>
          {ADMIN_ACCENT_THEME_OPTIONS.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
