"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Ship } from "lucide-react";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingHeaderProps {
  booking: Pick<
    BookingDetails,
    | "id"
    | "boatId"
    | "boatName"
    | "boatTimezone"
    | "customerName"
    | "startDateTime"
  >;
}

function formatTripDate(
  startIso: Date | null | undefined,
  boatTimezone: string | null
): string | null {
  if (!startIso) return null;
  const parsed = parseDateTimeInBoatTimezone(
    typeof startIso === "string" ? startIso : startIso.toISOString(),
    { timezone: boatTimezone ?? undefined }
  );
  if (!parsed?.date) return null;
  return format(parsed.date, "EEE, MMM d, yyyy");
}

export function AdminBookingHeader({ booking }: AdminBookingHeaderProps) {
  const shortId = booking.id.slice(0, 6).toUpperCase();
  const tripDate = formatTripDate(booking.startDateTime, booking.boatTimezone);

  return (
    <div className="min-w-0 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Booking #{shortId}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {booking.customerName || "Unnamed customer"}
        </h1>
        {booking.boatName || tripDate ? (
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            {booking.boatId && booking.boatName ? (
              <Link
                href={`/admin/boats/${booking.boatId}`}
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <Ship className="h-3.5 w-3.5" />
                {booking.boatName}
              </Link>
            ) : booking.boatName ? (
              <span className="inline-flex items-center gap-1">
                <Ship className="h-3.5 w-3.5" />
                {booking.boatName}
              </span>
            ) : null}
            {booking.boatName && tripDate ? <span aria-hidden>·</span> : null}
            {tripDate ? <span>{tripDate}</span> : null}
          </p>
        ) : null}
    </div>
  );
}
