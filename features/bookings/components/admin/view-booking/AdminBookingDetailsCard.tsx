import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
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
  const avatarInitial = (booking.customerName || booking.userEmail || "?")[0].toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Booking details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Customer
            </h3>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {booking.userProfileImage ? (
                  <Image
                    src={booking.userProfileImage}
                    alt={booking.customerName || "Customer"}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-medium text-white">
                    {avatarInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium leading-tight">{booking.customerName || "—"}</p>
                  {booking.userId && (
                    <Link
                      href={`/admin/users/${booking.userId}`}
                      className="text-xs text-primary hover:underline leading-none"
                    >
                      View profile
                    </Link>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </h4>
                  {booking.customerEmail ? (
                    <a
                      href={`mailto:${booking.customerEmail}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {booking.customerEmail}
                    </a>
                  ) : (
                    <p className="text-sm font-medium">—</p>
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </h4>
                  <p className="text-sm font-medium">{booking.customerPhone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Boat</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium leading-tight">{booking.boatName || "—"}</p>
                {booking.boatId && (
                  <Link
                    href={`/admin/boats/${booking.boatId}`}
                    className="text-xs text-primary hover:underline leading-none"
                  >
                    View boat
                  </Link>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </h4>
                <p className="text-sm font-medium">{booking.boatCategory || "—"}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Capacity
                </h4>
                <p className="text-sm font-medium">{booking.boatCapacity ?? "—"} people</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Trip</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Booking type
              </h4>
              <p className="text-sm font-medium capitalize">
                {booking.bookingType?.replace(/_/g, " ").toLowerCase() || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Booking ID
              </h4>
              <p className="font-mono text-sm">{booking.id.substring(0, 8)}…</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Start</h4>
              <p className="text-sm font-medium">
                {formatDateTime(booking.startDateTime, booking.boatTimezone)}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">End</h4>
              <p className="text-sm font-medium">
                {formatDateTime(booking.endDateTime, booking.boatTimezone)}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Passengers
              </h4>
              <p className="text-sm font-medium">{booking.numberOfPassengers ?? "—"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
