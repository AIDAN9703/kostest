import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Ship } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
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
    | "paymentStatus"
    | "numberOfPassengers"
    | "totalAmountCents"
  >;
}

export function AdminBookingProfileHeader({
  booking,
}: AdminBookingProfileHeaderProps) {
  return (
    <Card className="overflow-hidden rounded-3xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6 relative">
          {/* Boat Image */}
          <div className="md:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
            {booking.boatMainImage ? (
              <Image
                src={booking.boatMainImage}
                alt={booking.boatName || "Boat"}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Ship className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="flex-1 space-y-6 min-w-0 pr-8">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">
                  Booking #{booking.id.slice(0, 6).toUpperCase()}
                </h2>
                <div className="flex gap-1 flex-wrap">
                  <StatusBadge status={booking.bookingStatus} />
                  <StatusBadge status={booking.paymentStatus} />
                  {booking.bookingType && (
                    <StatusBadge status={booking.bookingType} />
                  )}
                </div>
              </div>
              {booking.boatId && booking.boatName && (
                <Link
                  href={`/admin/boats/${booking.boatId}`}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {booking.boatName}
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Guests
                </div>
                <div className="mt-1 text-base font-medium">
                  {booking.numberOfPassengers ?? "—"} people
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total
                </div>
                <div className="mt-1 text-base font-medium">
                  {formatCentsAsCurrency(booking.totalAmountCents)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
