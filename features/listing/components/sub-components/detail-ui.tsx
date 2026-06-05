import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * Lean, dense building blocks for the boat detail page. Navy/white, hairline
 * dividers, text-forward — optimized for information density, not whitespace.
 */

export function Section({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2.5">
        {icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.07] text-primary">
            {icon}
          </span>
        )}
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** A compact label / value row for spec-style tables. */
export function Fact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** Dense multi-column checklist (features, safety equipment, etc.). */
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground/85">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" strokeWidth={2.75} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Small inline pill used for header highlights. */
export function Pill({
  icon,
  children,
  accent = false,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        accent
          ? "bg-emerald-50 text-emerald-700"
          : "border border-border bg-card text-foreground/80"
      )}
    >
      {icon}
      {children}
    </span>
  );
}
