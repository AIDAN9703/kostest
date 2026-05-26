"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
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
  summarizeChecklist,
} from "@/features/bookings/booking-checklist";

interface AdminBookingChecklistCardProps {
  bookingId: string;
  items: BookingChecklistItem[];
}

/**
 * "What's still left to do" lifecycle checklist. Derived items are read-only
 * (server-of-truth = payments ledger, booking status, captain assignment).
 * Manual items are toggleable booleans on `booking_ops`.
 */
export function AdminBookingChecklistCard({
  bookingId,
  items,
}: AdminBookingChecklistCardProps) {
  const summary = summarizeChecklist(items);

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Status</CardTitle>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
              summary.done === summary.total
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {summary.done} / {summary.total}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.map((item) => (
          <ChecklistRow key={item.id} bookingId={bookingId} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}

function ChecklistRow({
  bookingId,
  item,
}: {
  bookingId: string;
  item: BookingChecklistItem;
}) {
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
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
        done
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : done ? (
        <Check className="h-3 w-3" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
      )}
    </span>
  );

  const content = (
    <>
      {indicator}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.kind === "derived" ? (
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Auto
        </span>
      ) : null}
    </>
  );

  const baseClasses =
    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors";

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
          done ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          isPending && "opacity-70"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      title={item.hint}
      className={cn(
        baseClasses,
        done ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {content}
    </div>
  );
}
