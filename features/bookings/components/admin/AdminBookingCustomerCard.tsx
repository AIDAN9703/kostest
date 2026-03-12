import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingCustomerCardProps {
  booking: Pick<
    BookingDetails,
    | "userId"
    | "customerName"
    | "customerEmail"
    | "customerPhone"
    | "userProfileImage"
    | "userEmail"
  >;
}

export function AdminBookingCustomerCard({ booking }: AdminBookingCustomerCardProps) {
  const avatarInitial = (
    booking.customerName ||
    booking.userEmail ||
    "?"
  )[0].toUpperCase();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {booking.userProfileImage ? (
              <Image
                src={booking.userProfileImage}
                alt={booking.customerName || "Customer"}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-blue-600 text-white text-sm font-medium">
                {avatarInitial}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base">
              {booking.customerName || "—"}
            </p>
            {booking.userId && (
              <Link
                href={`/admin/users/${booking.userId}`}
                className="text-xs text-primary hover:underline mt-1 block"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Phone
            </h4>
            <p className="text-sm font-medium">
              {booking.customerPhone || "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
