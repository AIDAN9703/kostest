"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  useAdminAccentTheme,
  type AdminAccentTheme,
} from "@/shared/admin/admin-accent-theme";
import { ADMIN_ACCENT_THEME_OPTIONS } from "@/shared/admin/admin-accent-theme.config";
import { adminShellClassName } from "@/shared/admin/admin-shell-classes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function AdminAppearanceSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-10 w-40 animate-pulse rounded-xl border border-border bg-muted/40" />
    );
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-40 rounded-xl">
        <SelectValue placeholder="Select appearance" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function AdminAccentThemeSelect() {
  const { activeTheme, setActiveTheme } = useAdminAccentTheme();

  return (
    <Select
      value={activeTheme}
      onValueChange={(value) => setActiveTheme(value as AdminAccentTheme)}
    >
      <SelectTrigger className="w-40 rounded-xl">
        <SelectValue placeholder="Select accent" />
      </SelectTrigger>
      <SelectContent align="end" className={adminShellClassName(activeTheme)}>
        {ADMIN_ACCENT_THEME_OPTIONS.map((theme) => (
          <SelectItem key={theme.value} value={theme.value}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
