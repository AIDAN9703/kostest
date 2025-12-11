"use client";

import { ArrowLeft, Ship, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { StatusBadge } from "@/shared/lib/utils/badge-utils";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { AdminAssignmentCard } from "@/features/bookings/components/AdminAssignmentCard";
import { EditableField } from "@/features/bookings/components/EditableField";
import { EditableDateField } from "@/features/bookings/components/EditableDateField";
import { useBooking } from "@/features/bookings/hooks/useBookings";
import { ApproveBookingButton } from "./ApproveBookingButton";
import type { BookingDetails } from "@/features/bookings/booking.types";

interface BookingDetailsClientProps {
  initialBooking: BookingDetails;
}

export function BookingDetailsClient({
  initialBooking,
}: BookingDetailsClientProps) {
  const { data: booking = initialBooking } = useBooking(initialBooking.id, {
    initialData: initialBooking,
    staleTime: Infinity, // Trust server data initially
  });

  const isPendingRequest =
    booking.bookingType === "REQUEST" && booking.bookingStatus === "PENDING";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/bookings"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Booking Details
            </h1>
            <p className="text-gray-500 mt-1">
              Created{" "}
              {booking.createdAt
                ? format(booking.createdAt, "MMM d, yyyy 'at' h:mma")
                : "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {booking.customerEmail && (
            <Button variant="outline" asChild>
              <a href={`mailto:${booking.customerEmail}`}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          )}
          {isPendingRequest && <ApproveBookingButton bookingId={booking.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details Card */}
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
                    {booking.bookingType?.replace(/_/g, " ").toLowerCase() ||
                      "-"}
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
                  <EditableDateField
                    bookingId={booking.id}
                    field="startDateTime"
                    value={booking.startDateTime}
                    includeTime={true}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    End Date & Time
                  </h3>
                  <EditableDateField
                    bookingId={booking.id}
                    field="endDateTime"
                    value={booking.endDateTime}
                    includeTime={true}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Number of Passengers
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="numberOfPassengers"
                    value={booking.numberOfPassengers}
                    type="number"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Special Requests
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="specialRequests"
                    value={booking.specialRequests}
                    type="text"
                    className="font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Payment Information</CardTitle>
                {booking.paymentStatus && (
                  <StatusBadge status={booking.paymentStatus} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment Method
                  </h3>
                  <p className="text-sm font-medium">
                    {booking.paymentMethod || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total Amount
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="totalAmount"
                    value={booking.totalAmount}
                    type="number"
                    formatType="currency"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Captain Fee
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="captainFee"
                    value={booking.captainFee}
                    type="number"
                    formatType="currency"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Cleaning Fee
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="cleaningFee"
                    value={booking.cleaningFee}
                    type="number"
                    formatType="currency"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Service Fee
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="serviceFee"
                    value={booking.serviceFee}
                    type="number"
                    formatType="currency"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tax
                  </h3>
                  <EditableField
                    bookingId={booking.id}
                    field="taxAmount"
                    value={booking.taxAmount}
                    type="number"
                    formatType="currency"
                    className="font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Card */}
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
                      {(booking.customerName ||
                        booking.userEmail ||
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <EditableField
                    bookingId={booking.id}
                    field="customerName"
                    value={booking.customerName}
                    type="text"
                    className="font-medium text-base"
                  />
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
                  <EditableField
                    bookingId={booking.id}
                    field="customerEmail"
                    value={booking.customerEmail}
                    type="email"
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Phone
                  </h4>
                  <EditableField
                    bookingId={booking.id}
                    field="customerPhone"
                    value={booking.customerPhone}
                    type="tel"
                    className="text-sm font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boat Card */}
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
                  <h3 className="font-medium text-base truncate">
                    {booking.boatName}
                  </h3>
                  {booking.boatId && (
                    <Link
                      href={`/admin/boats/${booking.boatId}`}
                      className="text-xs text-primary hover:underline mt-1 block"
                    >
                      View Boat
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
                    {booking.boatCategory || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Capacity
                  </h4>
                  <p className="text-sm font-medium">
                    {booking.boatCapacity || "-"} people
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Assignment Card */}
          <AdminAssignmentCard
            bookingId={booking.id}
            assignedAdminId={booking.assignedAdminId}
            assignedAdminFirstName={booking.assignedAdminFirstName}
            assignedAdminLastName={booking.assignedAdminLastName}
            assignedAdminEmail={booking.assignedAdminEmail}
            contactedAt={booking.contactedAt}
          />
        </div>
      </div>
    </div>
  );
}
