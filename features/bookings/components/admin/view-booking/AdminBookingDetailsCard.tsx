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
  return format(parsed.date, "MMM d, yyyy h:mm a") || "—";
}

export function AdminBookingDetailsCard({ booking }: AdminBookingDetailsCardProps) {
  const customerName = booking.customerName?.trim() || "—";
  const boatName = booking.boatName?.trim() || "—";

  const interactiveText =
    "text-foreground underline-offset-4 hover:text-primary hover:underline";

  const sectionHeading =
    "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <Card className="h-full rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customer &amp; trip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0 space-y-3">
            <h3 className={sectionHeading}>Customer</h3>
            <div className="space-y-2 text-sm">
              {booking.userId ? (
                <Link
                  href={`/admin/users/${booking.userId}`}
                  className={`block font-medium ${interactiveText}`}
                >
                  {customerName}
                </Link>
              ) : (
                <p className="font-medium text-foreground">{customerName}</p>
              )}
              {booking.customerEmail ? (
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className={`block ${interactiveText}`}
                >
                  {booking.customerEmail}
                </a>
              ) : null}
              {booking.customerPhone ? (
                <a
                  href={`tel:${booking.customerPhone.replace(/\s/g, "")}`}
                  className={`block ${interactiveText}`}
                >
                  {booking.customerPhone}
                </a>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <h3 className={sectionHeading}>Boat</h3>
            <div className="text-sm">
              {booking.boatId ? (
                <Link
                  href={`/admin/boats/${booking.boatId}`}
                  className={`font-medium ${interactiveText}`}
                >
                  {boatName}
                </Link>
              ) : (
                <p className="font-medium text-foreground">{boatName}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-border/60 pt-8 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0 space-y-3 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                From
              </p>
              <p className="text-foreground">
                {formatDateTime(booking.startDateTime, booking.boatTimezone)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                To
              </p>
              <p className="text-foreground">
                {formatDateTime(booking.endDateTime, booking.boatTimezone)}
              </p>
            </div>
          </div>

          <div className="min-w-0 space-y-8">
            <div className="space-y-3">
              <h3 className={sectionHeading}>Passengers</h3>
              <p className="text-sm text-foreground">{booking.numberOfPassengers ?? "—"}</p>
            </div>
            <div className="space-y-3">
              <h3 className={sectionHeading}>Booking ID</h3>
              <p className="break-all font-mono text-xs text-foreground">{booking.id}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
