import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingDetailsCardProps {
  booking: BookingDetails;
}

function formatDateTime(
  dateTime: Date | string | null | undefined,
  boatTimezone: string | null | undefined
) {
  if (!dateTime) return "—";
  const parsed = parseDateTimeInBoatTimezone(dateTime, {
    timezone: boatTimezone ?? undefined,
  });
  if (!parsed?.date) return "—";
  return `${format(parsed.date, "MMM d, yyyy")} ${parsed.time}`.trim() || "—";
}

export function AdminBookingDetailsCard({ booking }: AdminBookingDetailsCardProps) {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer &amp; trip</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{booking.customerName || "—"}</p>
              {booking.userId && (
                <Link
                  href={`/admin/users/${booking.userId}`}
                  className="text-xs text-primary hover:underline"
                >
                  View profile
                </Link>
              )}
              {booking.customerEmail ? (
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="block font-medium text-primary hover:underline"
                >
                  {booking.customerEmail}
                </a>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
              <p className="text-foreground">{booking.customerPhone || "—"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Boat
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{booking.boatName || "—"}</p>
              {booking.boatId && (
                <Link
                  href={`/admin/boats/${booking.boatId}`}
                  className="text-xs text-primary hover:underline"
                >
                  View boat
                </Link>
              )}
              <p className="text-muted-foreground">
                {booking.boatCategory || "—"}
                {booking.boatCapacity != null ? ` · ${booking.boatCapacity} guests` : ""}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Trip
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize text-right">
                  {booking.bookingType?.replace(/_/g, " ").toLowerCase() || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Start</dt>
                <dd className="text-right font-medium">
                  {formatDateTime(booking.startDateTime, booking.boatTimezone)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">End</dt>
                <dd className="text-right font-medium">
                  {formatDateTime(booking.endDateTime, booking.boatTimezone)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Passengers</dt>
                <dd className="font-medium text-right">{booking.numberOfPassengers ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Booking ID</dt>
                <dd className="font-mono text-xs text-right">{booking.id.slice(0, 8)}…</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
