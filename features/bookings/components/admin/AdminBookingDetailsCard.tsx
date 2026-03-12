import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingDetailsCardProps {
  booking: Pick<
    BookingDetails,
    | "id"
    | "bookingType"
    | "bookingStatus"
    | "startDateTime"
    | "endDateTime"
    | "numberOfPassengers"
    | "specialRequests"
    | "boatTimezone"
  >;
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
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Booking Details</CardTitle>
          <StatusBadge status={booking.bookingStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Booking Type
            </h3>
            <p className="text-sm font-medium capitalize">
              {booking.bookingType?.replace(/_/g, " ").toLowerCase() || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Booking ID
            </h3>
            <p className="text-sm font-mono">
              {booking.id.substring(0, 8)}...
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Start Date & Time
            </h3>
            <p className="text-sm font-medium">
              {formatDateTime(booking.startDateTime, booking.boatTimezone)}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              End Date & Time
            </h3>
            <p className="text-sm font-medium">
              {formatDateTime(booking.endDateTime, booking.boatTimezone)}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Number of Passengers
            </h3>
            <p className="text-sm font-medium">
              {booking.numberOfPassengers ?? "—"}
            </p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Special Requests
            </h3>
            <p className="text-sm font-medium">
              {booking.specialRequests || "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
