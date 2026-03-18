import Link from "next/link";
import Image from "next/image";
import { Ship } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { PAYMENT_DISPLAY_DESCRIPTIONS } from "@/shared/lib/utils/payment-display";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingProfileHeaderProps {
  booking: Pick<
    BookingDetails,
    | "id"
    | "boatId"
    | "boatName"
    | "boatMainImage"
    | "bookingStatus"
    | "bookingType"
    | "paymentDisplayStatus"
  >;
}

const BOOKING_STATUS_HINT: Record<string, string> = {
  DRAFT: "Sent to customer as a quote; not accepted or paid yet.",
  PENDING: "Request waiting for approval before customer can pay.",
  APPROVED: "Approved — customer still needs to complete payment.",
  CONFIRMED: "Paid and locked in.",
  CANCELLED: "Cancelled — check cancellation reason and payment status for details.",
  COMPLETED: "Trip finished.",
};

const BOOKING_TYPE_HINT: Record<string, string> = {
  REQUEST: "Customer asked to book; you approve then they pay.",
  INSTANT_BOOK: "Customer paid immediately on the site.",
  EXTERNAL_BOOKING: "Created in admin (phone/email); lifecycle you control.",
};

function hint(map: Record<string, string>, key: string | null | undefined) {
  if (!key) return "—";
  return map[key.toUpperCase()] ?? "Current state for this booking.";
}

export function AdminBookingProfileHeader({
  booking,
}: AdminBookingProfileHeaderProps) {
  const paymentDesc =
    PAYMENT_DISPLAY_DESCRIPTIONS[booking.paymentDisplayStatus] ?? "—";

  return (
    <Card className="overflow-hidden rounded-3xl">
      <CardContent className="p-6">
        <div className="relative flex flex-col items-start gap-6 md:flex-row">
          <div className="h-48 w-full shrink-0 overflow-hidden rounded-lg bg-muted md:w-48">
            {booking.boatMainImage ? (
              <Image
                src={booking.boatMainImage}
                alt={booking.boatName || "Boat"}
                width={192}
                height={192}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Ship className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Booking #{booking.id.slice(0, 6).toUpperCase()}
              </h1>
              {booking.boatId && booking.boatName ? (
                <Link
                  href={`/admin/boats/${booking.boatId}`}
                  className="text-base text-muted-foreground hover:text-foreground hover:underline md:text-lg"
                >
                  {booking.boatName}
                </Link>
              ) : (
                <p className="text-base text-muted-foreground md:text-lg">—</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Booking status
                </h3>
                <StatusBadge
                  status={booking.bookingStatus}
                  title={hint(BOOKING_STATUS_HINT, booking.bookingStatus)}
                />
                <p className="text-sm text-muted-foreground">
                  {hint(BOOKING_STATUS_HINT, booking.bookingStatus)}
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment
                </h3>
                <StatusBadge
                  status={booking.paymentDisplayStatus}
                  title={paymentDesc}
                />
                <p className="text-sm text-muted-foreground">{paymentDesc}</p>
              </div>

              {booking.bookingType && (
                <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    How it was booked
                  </h3>
                  <StatusBadge
                    status={booking.bookingType}
                    title={hint(BOOKING_TYPE_HINT, booking.bookingType)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {hint(BOOKING_TYPE_HINT, booking.bookingType)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
