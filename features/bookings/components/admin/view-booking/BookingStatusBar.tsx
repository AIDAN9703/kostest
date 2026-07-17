import { Check } from "lucide-react";

import {
  BOOKING_STATUS_FLOW,
  BOOKING_STATUS_LABELS,
} from "@/features/bookings/booking-ui";
import { cn } from "@/shared/lib/utils/general-utils";

interface BookingStatusBarProps {
  status: string;
}

/**
 * Read-only lifecycle bar for the booking header — the bookings analog of
 * the inquiry pipeline bar. Status changes happen through their real flows
 * (approve, accept, payment, complete); this just makes the state legible.
 * CANCELLED renders as a banner instead of a step.
 */
export function BookingStatusBar({ status }: BookingStatusBarProps) {
  if (status === "CANCELLED") {
    return (
      <span className="inline-block rounded-full bg-destructive-soft px-2.5 py-1 text-[10px] font-semibold text-destructive">
        Cancelled
      </span>
    );
  }

  const currentIndex = BOOKING_STATUS_FLOW.indexOf(status);

  return (
    <ol className="flex min-w-0 items-center overflow-x-auto">
      {BOOKING_STATUS_FLOW.map((step, i) => {
        const isDone = currentIndex > i;
        const isCurrent = currentIndex === i;
        return (
          <li key={step} className={cn("flex items-center", i > 0 && "min-w-0 flex-1")}>
            {i > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-1.5 h-px min-w-3 flex-1 sm:mx-2",
                  isDone || isCurrent ? "bg-primary/50" : "bg-border/70"
                )}
              />
            ) : null}
            <span className="flex shrink-0 items-center gap-1.5 px-1.5 py-1">
              <span
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background ring-2 ring-primary/30",
                  !isDone && !isCurrent && "border-border bg-background"
                )}
              >
                {isDone ? (
                  <Check className="h-2.5 w-2.5" />
                ) : isCurrent ? (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs sm:text-sm",
                  isCurrent
                    ? "font-semibold"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {BOOKING_STATUS_LABELS[step]}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
