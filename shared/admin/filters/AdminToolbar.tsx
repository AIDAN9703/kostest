import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils/general-utils";

interface AdminToolbarProps {
  /** Left side: search + Filters button. */
  children: ReactNode;
  /** Right-aligned actions (create button, view toggle, …). */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Flat toolbar row for admin list pages: search + filters on the left,
 * actions pinned to the right. Sits above the table in <AdminListShell>.
 */
export function AdminToolbar({ children, trailing, className }: AdminToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
      {trailing ? (
        <div className="ml-auto flex flex-wrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
