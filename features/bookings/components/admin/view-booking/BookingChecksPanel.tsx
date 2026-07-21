"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { cn } from "@/shared/lib/utils/general-utils";
import { updateBookingOps } from "@/features/bookings/actions/booking-ops.actions";
import {
  type BookingChecklistItem,
  type BookingChecklistSection,
} from "@/features/bookings/booking-checklist";

interface BookingChecksPanelProps {
  bookingId: string;
  items: BookingChecklistItem[];
}

const SECTION_ORDER: BookingChecklistSection[] = [
  "Sales",
  "Money",
  "Paperwork",
  "Crew",
  "Trip",
];

/**
 * Booking checks — modeled on the owners' fleet-inspection tool: sections
 * with X/Y counters, an overall progress bar, tap-to-check items. Derived
 * items check themselves from real data (payments ledger, assignments,
 * status); manual items toggle booking_ops flags.
 */
export function BookingChecksPanel({ bookingId, items }: BookingChecksPanelProps) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const allDone = done === total && total > 0;

  const sections = SECTION_ORDER.map((section) => ({
    section,
    items: items.filter((i) => i.section === section),
  })).filter((s) => s.items.length > 0);

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            Booking checks
          </CardTitle>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
              allDone ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
            )}
          >
            {done}/{total} complete
          </span>
        </div>
        {/* Overall progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allDone ? "bg-success" : "bg-primary"
            )}
            style={{ width: total > 0 ? `${(done / total) * 100}%` : "0%" }}
          />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-x-8 gap-y-4 pb-4 sm:grid-cols-2">
        {sections.map(({ section, items: sectionItems }) => {
          const sectionDone = sectionItems.filter((i) => i.done).length;
          return (
            <section key={section}>
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {section}
                </h4>
                <span
                  className={cn(
                    "text-[10px] font-semibold tabular-nums",
                    sectionDone === sectionItems.length
                      ? "text-success"
                      : "text-muted-foreground/70"
                  )}
                >
                  {sectionDone}/{sectionItems.length}
                </span>
              </div>
              <div className="space-y-0.5">
                {sectionItems.map((item) => (
                  <CheckRow key={item.id} bookingId={bookingId} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CheckRow({ bookingId, item }: { bookingId: string; item: BookingChecklistItem }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  // Optimistic local state so the row checks immediately on click.
  const [optimisticDone, setOptimisticDone] = useState<boolean | null>(null);
  const done = optimisticDone ?? item.done;

  const handleToggle = () => {
    if (item.kind !== "manual" || !item.field) return;
    const next = !done;
    setOptimisticDone(next);
    startTransition(async () => {
      const result = await updateBookingOps(bookingId, {
        [item.field as string]: next,
      });
      if (!result.success) {
        setOptimisticDone(item.done);
        toast({
          title: "Couldn't update",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      router.refresh();
    });
  };

  const interactive = item.kind === "manual";

  const indicator = (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
        done
          ? "border-success bg-success text-success-foreground"
          : "border-border bg-background text-transparent"
      )}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <Check className="h-3 w-3" />
      )}
    </span>
  );

  const content = (
    <>
      {indicator}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          done && "text-muted-foreground line-through decoration-border"
        )}
      >
        {item.label}
      </span>
      {item.kind === "derived" ? (
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Auto
        </span>
      ) : null}
    </>
  );

  const baseClasses =
    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors";

  if (interactive) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        title={item.hint}
        className={cn(
          baseClasses,
          "text-left hover:bg-muted/60",
          done ? "text-foreground" : "text-foreground",
          isPending && "opacity-70"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div title={item.hint} className={cn(baseClasses, "text-foreground")}>
      {content}
    </div>
  );
}
