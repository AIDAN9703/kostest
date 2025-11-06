import { Metadata } from "next";
import { MessageSquare, Ship } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { formatCurrency } from "@/shared/utils/general-utils";
import { StatusBadge } from "@/shared/utils/badge-utils";
import Link from "next/link";
import { bookingService } from "@/features/bookings/booking.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import { type BookingDetails } from "@/features/bookings/booking.types";
import { format } from "date-fns";
import { parseDateTimeInBoatTimezone } from "@/shared/utils/date-helpers";
import { formatTime12Hour } from "@/shared/utils/general-utils";

export const metadata: Metadata = {
  title: "Booking Details | Admin Dashboard",
  description: "View and manage booking details",
};

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await bookingService.getBookingById(id);
  if (!booking) return notFound();

  // Format date/time for display
  const formatBookingDateTime = () => {
    if (!booking.startDateTime) return "-";
    
    const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(booking.startDateTime);
    const { time: endTime } = booking.endDateTime 
      ? parseDateTimeInBoatTimezone(booking.endDateTime)
      : { time: null };
      
    return startDate && startTime
      ? `${format(startDate, "MMM d, yyyy")} ${formatTime12Hour(startTime)}${endTime ? ` - ${formatTime12Hour(endTime)}` : ""}`
      : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Booking #{booking.id}
          </h1>
          <p className="text-gray-500 mt-1">
            Created{" "}
            {booking.createdAt
              ? format(booking.createdAt, "MMM d, yyyy 'at' h:mma")
              : "Unknown"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button>Edit Booking</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Booking Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <StatusBadge status={booking.bookingStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Booking Type
                  </h3>
                  <p className="mt-1 capitalize">
                    {booking.bookingType?.replace(/_/g, " ").toLowerCase() ||
                      "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Booking ID
                  </h3>
                  <p className="mt-1 font-mono text-xs">{booking.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Date & Time
                  </h3>
                  <p className="mt-1">{formatBookingDateTime()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Number of Passengers
                  </h3>
                  <p className="mt-1">{booking.numberOfPassengers ?? "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Special Requests
                  </h3>
                  <p className="mt-1">{booking.specialRequests || "-"}</p>
                </div>
              </div>
              <Separator />
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Payment Information</CardTitle>
                {booking.paymentStatus && (
                  <StatusBadge status={booking.paymentStatus} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Payment Method
                    </h3>
                    <p className="mt-1">{booking.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Amount
                    </h3>
                    <p className="mt-1">
                      {formatCurrency(booking.totalAmount ?? 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Captain Fee
                    </h3>
                    <p className="mt-1">
                      {formatCurrency(booking.captainFee ?? 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Cleaning Fee
                    </h3>
                    <p className="mt-1">
                      {formatCurrency(booking.cleaningFee ?? 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Service Fee
                    </h3>
                    <p className="mt-1">
                      {formatCurrency(booking.serviceFee ?? 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tax</h3>
                    <p className="mt-1">
                      {formatCurrency(booking.taxAmount ?? 0)}
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
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
                      {(booking.customerName ||
                        booking.userEmail ||
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {booking.customerName || booking.userEmail || "Unknown"}
                  </h3>
                  {booking.userId && (
                    <Link
                      href={`/admin/users/${booking.userId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Email</h4>
                  <p className="text-sm">{booking.customerEmail}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                  <p className="text-sm">{booking.customerPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boat Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Boat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
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
                <div>
                  <h3 className="font-medium">{booking.boatName}</h3>
                  {booking.boatId && (
                    <Link
                      href={`/admin/boats/${booking.boatId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Boat
                    </Link>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">
                    Category
                  </h4>
                  <p className="text-sm">{booking.boatCategory || "-"}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  Capacity
                </h4>
                <p className="text-sm">{booking.boatCapacity || "-"} people</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
