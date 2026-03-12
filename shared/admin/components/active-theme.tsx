'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

const COOKIE_NAME = 'admin_active_theme';
const DEFAULT_THEME = 'default';

function setThemeCookie(theme: string) {
  if (typeof window === 'undefined') return;

  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
    window.location.protocol === 'https:' ? 'Secure;' : ''
  }`;
}

type ThemeContextType = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ActiveThemeProvider({
  children,
  initialTheme
}: {
  children: ReactNode;
  initialTheme?: string;
}) {
  const [activeTheme, setActiveTheme] = useState<string>(
    () => initialTheme || DEFAULT_THEME
  );

  useEffect(() => {
    setThemeCookie(activeTheme);

    const root = document.querySelector('[data-admin-theme]');
    if (!root) return;

    Array.from(root.classList)
      .filter((className) => className.startsWith('theme-'))
      .forEach((className) => {
        root.classList.remove(className);
      });
    root.classList.add(`theme-${activeTheme}`);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeConfig must be used within ActiveThemeProvider');
  }

  return context;
}

