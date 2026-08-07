"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/shared/lib/utils/general-utils";

type DayStatus = "available" | "booked" | "blocked" | "partial";

interface ApiCalendarDay {
  date: string;
  status: DayStatus;
}

/** Stable empty map so a loading month doesn't churn downstream memos. */
const EMPTY_STATUS_MAP = new Map<string, DayStatus>();

/**
 * Self-contained month calendar built directly on react-day-picker v9.
 *
 * We deliberately do NOT use shared/components/ui/calendar.tsx — that wrapper
 * mixes v8/v9 class keys and styles the grid as a `w-full` table, which blows
 * out to the full viewport inside an auto-width popover. Here every cell has a
 * fixed size and a custom day button, so the calendar is always ~17rem wide and
 * renders identically in the popover and the mobile drawer.
 */
export function BookingCalendar({
  boatId,
  selected,
  onSelect,
}: {
  boatId: string;
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [month, setMonth] = useState<Date>(startOfMonth(selected ?? today));

  // react-query: month flips hit the cache instantly, requests dedupe, and
  // there's no manual cancelled-effect bookkeeping.
  const monthKey = format(month, "yyyy-MM");
  const calendarQuery = useQuery({
    queryKey: ["boat-calendar", boatId, monthKey],
    staleTime: 30_000,
    queryFn: async () => {
      const res = await fetch(`/api/boats/${boatId}/calendar?month=${monthKey}`);
      if (!res.ok) throw new Error("calendar fetch failed");
      const data: { days?: ApiCalendarDay[] } = await res.json();
      const map = new Map<string, DayStatus>();
      for (const d of data.days ?? []) map.set(d.date.split("T")[0], d.status);
      return map;
    },
  });
  const statusByDay = calendarQuery.data ?? EMPTY_STATUS_MAP;
  const loading = calendarQuery.isFetching;
  const error = calendarQuery.isError;

  const { disabledDays, partialDays } = useMemo(() => {
    const disabled: Date[] = [];
    const partial: Date[] = [];
    for (const [key, status] of statusByDay) {
      const [y, m, d] = key.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (status === "booked" || status === "blocked") disabled.push(date);
      else if (status === "partial") partial.push(date);
    }
    return { disabledDays: disabled, partialDays: partial };
  }, [statusByDay]);

  return (
    <div className="w-full">
      <DayPicker
        mode="single"
        showOutsideDays
        selected={selected ?? undefined}
        onSelect={(d) => d && onSelect(d)}
        month={month}
        onMonthChange={setMonth}
        startMonth={startOfMonth(today)}
        disabled={[{ before: today }, ...disabledDays]}
        modifiers={{ partial: partialDays }}
        className="w-full"
        classNames={{
          months: "relative w-full",
          month: "w-full space-y-3",
          month_caption: "flex h-8 items-center justify-center",
          caption_label: "text-sm font-semibold text-foreground",
          nav: "absolute inset-x-0 top-0 flex items-center justify-between",
          button_previous:
            "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
          button_next:
            "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
          month_grid: "w-full border-collapse",
          weekdays: "grid grid-cols-7",
          weekday: "pb-1 text-center text-[0.7rem] font-medium uppercase text-muted-foreground/70",
          week: "mt-1 grid grid-cols-7",
          day: "flex justify-center p-0",
          hidden: "invisible",
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            ),
          DayButton: ({ day, modifiers, ...props }) => (
            <button
              {...props}
              className={cn(
                "relative grid h-10 w-full place-items-center rounded-lg text-sm font-medium transition-colors",
                modifiers.selected && "bg-primary text-white hover:bg-primary",
                !modifiers.selected && modifiers.today && "font-bold text-primary",
                !modifiers.selected && !modifiers.disabled && "text-foreground hover:bg-muted",
                modifiers.disabled && "cursor-not-allowed text-muted-foreground/30",
                modifiers.outside && !modifiers.selected && "text-muted-foreground/30",
                modifiers.partial &&
                  !modifiers.selected &&
                  "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-amber-500"
              )}
            >
              {day.date.getDate()}
            </button>
          ),
        }}
      />
      <div className="flex items-center justify-center gap-4 pt-1 text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Partly booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/30" />
          Unavailable
        </span>
        {loading && <span className="animate-pulse">Updating…</span>}
      </div>
      {error && (
        <p className="pt-1 text-center text-[0.7rem] text-amber-600">
          Couldn&apos;t load live availability — we&apos;ll confirm your date after you book.
        </p>
      )}
    </div>
  );
}
