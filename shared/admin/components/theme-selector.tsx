"use client";

import { Fragment } from "react";
import { adminThemedControl } from "@/shared/admin/admin-themed-frame";
import { useThemeConfig } from "@/shared/admin/components/active-theme";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils/general-utils";

const THEME_GROUPS = [
  {
    label: "Default",
    themes: [
      { name: "Default", value: "default" },
      { name: "Gold", value: "gold" },
      { name: "Blue", value: "blue" },
      { name: "Green", value: "green" },
      { name: "Amber", value: "amber" },
    ],
  },
  {
    label: "Monospaced",
    themes: [{ name: "Mono", value: "mono" }],
  },
] as const;

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          className={cn(
            adminThemedControl(),
            "justify-start gap-2",
            "*:data-[slot=select-value]:w-12"
          )}
        >
          <span className="hidden text-muted-foreground sm:block">Select a theme:</span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {THEME_GROUPS.map((group, index) => (
            <Fragment key={group.label}>
              {index > 0 && <SelectSeparator />}
              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>
                {group.themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
