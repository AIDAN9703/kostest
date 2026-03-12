import Link from "next/link";
import Image from "next/image";
import { Ship } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface AdminBookingBoatCardProps {
  booking: Pick<
    BookingDetails,
    "boatId" | "boatName" | "boatMainImage" | "boatCategory" | "boatCapacity"
  >;
}

export function AdminBookingBoatCard({ booking }: AdminBookingBoatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Boat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {booking.boatMainImage ? (
              <Image
                src={booking.boatMainImage}
                alt={booking.boatName || "Boat"}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <Ship className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-base">
              {booking.boatName || "—"}
            </p>
            {booking.boatId && (
              <Link
                href={`/admin/boats/${booking.boatId}`}
                className="text-xs text-primary hover:underline mt-1 block"
              >
                View Boat Details
              </Link>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Category
            </h4>
            <p className="text-sm font-medium">
              {booking.boatCategory || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Capacity
            </h4>
            <p className="text-sm font-medium">
              {booking.boatCapacity ?? "—"} people
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
