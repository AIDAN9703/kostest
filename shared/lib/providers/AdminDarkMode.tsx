"use client";

import { useLayoutEffect } from "react";

/**
 * The admin is dark-only (light mode removed 2026-07-21). This stamps
 * class="dark" on <html> — which every Tailwind dark: variant and every
 * portal (dialogs and dropdowns render into <body>) depends on — and lifts
 * it again when navigating back to the light marketing site. Direct admin
 * loads are covered before first paint by the inline script in
 * app/layout.tsx; this handles SPA navigation in and out.
 */
export function AdminDarkMode() {
  useLayoutEffect(() => {
    const el = document.documentElement;
    el.classList.add("dark");
    el.style.colorScheme = "dark";
    return () => {
      el.classList.remove("dark");
      el.style.colorScheme = "";
    };
  }, []);

  return null;
}
