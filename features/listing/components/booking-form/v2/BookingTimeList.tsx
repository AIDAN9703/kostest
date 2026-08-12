"use client";

import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { useBoatTimeSlots } from "./useBoatTimeSlots";

/** Available start times (boat-local), in 30-minute slots. */
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

  return (
    <div className="w-full space-y-3">
      {error && (
        <p className="px-1 text-center text-xs text-amber-600">
          Couldn&apos;t load live availability — please try again in a moment or pick another
          date.
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
          No open slots for this date — try another day.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2 px-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              vessel local time
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
