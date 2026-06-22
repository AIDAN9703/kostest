"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ADMIN_ACCENT_THEME_COOKIE,
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
