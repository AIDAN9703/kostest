import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Shared wrapper for admin list pages (bookings, users, etc.)
 * Encapsulates the standard card styling: rounded corners, border, shadow, overflow.
 */
export function AdminTableWrapper({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xs",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
