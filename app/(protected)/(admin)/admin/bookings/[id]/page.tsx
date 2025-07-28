import { Metadata } from "next";
import { CalendarCheck, Check, Clock3, CreditCard, MessageSquare, Ship, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { formatCurrency } from "@/shared/utils/general-utils";
import Link from "next/link";
import { getBookingById } from "@/features-admin/bookings/actions/bookings";
import { notFound } from "next/navigation";
import { bookings } from "@/database/schema";
import Image from "next/image";
import NextImage from "next/image";

// Extend the inferred type with joined fields
// (add more fields as needed based on your getBookingById return)
type BookingWithJoins = {
  id: string;
  bookingType: string;
  bookingStatus: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  startDateTime: Date | null;
  endDateTime: Date | null;
  numberOfPassengers: number | null;
  totalAmount: number | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  needsCaptain: boolean | null;
  specialRequests: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  captainFee?: number | null;
  cleaningFee?: number | null;
  serviceFee?: number | null;
  taxAmount?: number | null;
  // Joined fields
  boatCategory?: string | null;
  boatCapacity?: number | null;
  boatId?: string | null;
  boatName?: string | null;
  boatMainImage?: string | null;
  userId?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  userEmail?: string | null;
  userProfileImage?: string | null;
};

export const metadata: Metadata = {
  title: "Booking Details | Admin Dashboard",
  description: "View and manage booking details",
};

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const booking: BookingWithJoins | null = await getBookingById(resolvedParams.id);
  if (!booking) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking #{booking.id}</h1>
          <p className="text-gray-500 mt-1">
            Created on {booking.createdAt?.toLocaleDateString()} at {booking.createdAt?.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button>
            Edit Booking
          </Button>
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
                  <h3 className="text-sm font-medium text-gray-500">Booking Type</h3>
                  <p className="mt-1">{booking.bookingType || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                  <p className="mt-1">{booking.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1">
                    {booking.startDateTime ? new Date(booking.startDateTime).toLocaleDateString() : "-"}
                    {booking.endDateTime ? ` - ${new Date(booking.endDateTime).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="mt-1">
                    {booking.startDateTime ? new Date(booking.startDateTime).toLocaleTimeString() : "-"}
                    {booking.endDateTime ? ` - ${new Date(booking.endDateTime).toLocaleTimeString()}` : ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Passengers</h3>
                  <p className="mt-1">{typeof booking.numberOfPassengers === 'number' ? booking.numberOfPassengers : '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
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
                <PaymentStatusBadge status={booking.paymentStatus ?? ""} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p className="mt-1">{booking.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="mt-1">{formatCurrency(booking.totalAmount ?? 0)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Captain Fee</h3>
                    <p className="mt-1">{formatCurrency(booking.captainFee ?? 0)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cleaning Fee</h3>
                    <p className="mt-1">{formatCurrency(booking.cleaningFee ?? 0)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service Fee</h3>
                    <p className="mt-1">{formatCurrency(booking.serviceFee ?? 0)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tax</h3>
                    <p className="mt-1">{formatCurrency(booking.taxAmount ?? 0)}</p>
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
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div>
                  <h3 className="font-medium">{booking.customerName}</h3>
                  {typeof booking.userId === 'string' ? (
                    <Link href={`/admin/users/${booking.userId}`} className="text-sm text-primary hover:underline">
                      View Profile
                    </Link>
                  ) : null}
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
                {booking.boatMainImage ? (
                  <NextImage src={booking.boatMainImage} alt={booking.boatName || "Boat"} width={96} height={96} className="rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                    <Ship className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{booking.boatName}</h3>
                  {booking.boatId && (
                    <Link href={`/admin/boats/${booking.boatId}`} className="text-sm text-primary hover:underline">
                      View Boat
                    </Link>
                  )}
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Category</h4>
                  <p className="text-sm">{booking.boatCategory || "-"}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Capacity</h4>
                <p className="text-sm">{booking.boatCapacity || "-"} people</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <X className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <CreditCard className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
} 