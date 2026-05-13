"use client";

import { useKBar } from "kbar";
import { IconSearch } from "@tabler/icons-react";
import {
  adminHeaderControlBase,
  adminHeaderNeutralChrome,
} from "@/shared/admin/admin-themed-frame";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils/general-utils";

export default function SearchInput() {
  const { query } = useKBar();
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        adminHeaderControlBase,
        adminHeaderNeutralChrome,
        "relative w-full justify-start rounded-md bg-background text-muted-foreground md:w-40 lg:w-64 sm:pr-12"
      )}
      onClick={query.toggle}
    >
      <IconSearch className="mr-2 h-4 w-4 shrink-0 opacity-80" />
      Search...
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-6 -translate-y-1/2 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
