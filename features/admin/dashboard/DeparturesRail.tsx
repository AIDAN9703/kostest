"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow } from "date-fns";
import { Anchor, ArrowRight, Users } from "lucide-react";

import type { BookingListItem } from "@/features/bookings/booking.types";
import { isTripUrgent, readinessGaps } from "@/features/bookings/lib/trip-readiness";
import { formatBoatLocal, parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { cn } from "@/shared/lib/utils/general-utils";

/**
 * The next departures as boarding-pass tickets: day, boat-local time, boat,
 * customer, guests, and a readiness state — green when the boat can leave
 * the dock, amber when something's missing, red when it's missing AND the
 * trip is inside the urgency window. This is the "which ones?" behind the
 * hero's "N to prep".
 */
export function DeparturesRail({ trips, days = 7 }: { trips: BookingListItem[]; days?: number }) {
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + days);
  const visible = trips.filter((t) => t.startDateTime && new Date(t.startDateTime) <= horizon);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">Next departures</h2>
        <Link
          href="/admin/bookings?view=calendar"
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {days} days · calendar <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {visible.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
          Nothing leaving the dock in the next {days} days.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {visible.map((trip, i) => (
            <Ticket key={trip.id} trip={trip} index={i} />
          ))}
        </ul>
      )}
    </motion.section>
  );
}

function Ticket({ trip, index }: { trip: BookingListItem; index: number }) {
  const start = new Date(trip.startDateTime as Date);
  const boatDay = parseDateTimeInBoatTimezone(start, { timezone: trip.boatTimezone }).date ?? start;
  const dayLabel = isToday(boatDay) ? "Today" : isTomorrow(boatDay) ? "Tomorrow" : format(boatDay, "EEE d");
  const gaps = readinessGaps(trip);
  const urgent = isTripUrgent(trip);
  const state = gaps.length === 0 ? "ready" : urgent ? "urgent" : "prep";

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/admin/bookings/${trip.id}`}
        className={cn(
          "group relative flex gap-4 overflow-hidden rounded-2xl border px-4 py-3.5 transition-colors",
          state === "ready" && "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]",
          state === "prep" && "border-warning/20 bg-warning/[0.05] hover:bg-warning/[0.08]",
          state === "urgent" && "border-destructive/25 bg-destructive/[0.06] hover:bg-destructive/[0.09]"
        )}
      >
        {/* Day + time stub */}
        <span className="w-16 shrink-0 border-r border-white/[0.08] pr-4">
          <span
            className={cn(
              "block font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
              isToday(boatDay) ? "text-primary-strong" : "text-muted-foreground"
            )}
          >
            {dayLabel}
          </span>
          <span className="mt-1 block text-lg font-semibold leading-6 tabular-nums text-foreground">
            {formatBoatLocal(start, trip.boatTimezone, "h:mm")}
          </span>
          <span className="block text-[10px] uppercase text-muted-foreground">
            {formatBoatLocal(start, trip.boatTimezone, "a zzz")}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{trip.boatName ?? "Boat TBD"}</span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">{trip.customerName ?? "Unnamed customer"}</span>
            {trip.numberOfPassengers ? (
              <span className="flex shrink-0 items-center gap-1">
                <Users className="h-3 w-3" /> {trip.numberOfPassengers}
              </span>
            ) : null}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            {gaps.length === 0 ? (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready
              </span>
            ) : (
              gaps.map((g) => (
                <span
                  key={g.kind}
                  className={cn(
                    "rounded-full px-2 py-px text-[10px] font-semibold",
                    g.tone === "warning" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                  )}
                >
                  {g.label}
                </span>
              ))
            )}
            {trip.needsCaptain && trip.captainUserId ? (
              <Anchor className="h-3 w-3 text-muted-foreground/60" aria-label="Captain assigned" />
            ) : null}
          </span>
        </span>
      </Link>
    </motion.li>
  );
}
