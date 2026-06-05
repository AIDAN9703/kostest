"use client";

import { Pencil } from "lucide-react";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { useBoatTimeSlots } from "./useBoatTimeSlots";

/**
 * Available start times (boat-local) plus a custom-time entry at the top.
 *
 * The custom field just sets the same "HH:mm" value the slot buttons produce —
 * it never touches the booking schema or the downstream flow.
 */
export function BookingTimeList({
  date,
  boat,
  durationHours,
  selectedTime,
  onSelect,
}: {
  date: Date;
  boat: { id: string; timezone?: string | null };
  durationHours: number;
  selectedTime: string;
  onSelect: (time: string) => void;
}) {
  const { slots, loading, error } = useBoatTimeSlots({ date, boat, durationHours });
  const available = slots.filter((s) => s.isAvailable);
  const isCustom = !!selectedTime && !available.some((s) => s.time === selectedTime);

  const customField = (
    <label
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors",
        isCustom ? "border-primary bg-primary/[0.04]" : "border-border bg-card"
      )}
    >
      <Pencil className="size-4 shrink-0 text-primary" />
      <span className="flex-1 text-sm font-medium text-foreground">Enter a custom time</span>
      <input
        type="time"
        value={selectedTime}
        onChange={(e) => e.target.value && onSelect(e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
        aria-label="Custom start time"
      />
    </label>
  );

  return (
    <div className="w-full space-y-3">
      {customField}

      {error && (
        <p className="px-1 text-center text-xs text-amber-600">
          Couldn&apos;t load live availability — you can still enter a time above; we&apos;ll
          confirm it after you book.
        </p>
      )}

      {loading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : available.length === 0 ? (
        <p className="px-1 py-2 text-center text-sm text-muted-foreground">
          No open slots for this date — enter a custom time above or try another day.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 px-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              or pick a slot · vessel local time
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]">
            {available.map((slot) => {
              const isSelected = slot.time === selectedTime;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => onSelect(slot.time)}
                  className={cn(
                    "h-11 w-full rounded-xl border text-center text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/[0.03]"
                  )}
                >
                  {formatTime12Hour(slot.time)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
