import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Labelled field row used inside <FilterPopover>: small icon + label above a control.
 * Pass `className="sm:col-span-2"` for full-width fields (date ranges, etc).
 */
export function FilterField({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      {children}
    </div>
  );
}
