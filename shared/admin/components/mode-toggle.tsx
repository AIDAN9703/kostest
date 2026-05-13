"use client";

import { IconBrightness } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { adminHeaderNeutralChrome } from "@/shared/admin/admin-themed-frame";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils/general-utils";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      if (e) {
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme],
  );

  return (
    <Button
      variant="ghost"
      className={cn(
        adminHeaderNeutralChrome,
        "size-10 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={handleThemeToggle}
    >
      <IconBrightness />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
