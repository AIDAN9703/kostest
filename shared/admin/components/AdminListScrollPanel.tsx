import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Scrollable content region for <AdminListShell> when the child is not
 * <AdminDataTable> (e.g. custom tables with extra rows, card grids, calendars).
 */
export function AdminListScrollPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl border border-border/60 bg-card shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
