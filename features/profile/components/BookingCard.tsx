"use client";

import { Badge } from "@/shared/components/ui/badge";
import { CalendarDays, Clock, Users, MapPin, Anchor } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { ProfileBooking } from "@/features/bookings/booking.types";

interface BookingCardProps {
  booking: ProfileBooking;
}

const statusConfig = {
  confirmed: { color: "bg-emerald-100 text-emerald-800", label: "Confirmed" },
  approved: {
    color: "bg-blue-100 text-blue-800",
    label: "Approved - Awaiting Payment",
  },
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
};

export function BookingCard({ booking }: BookingCardProps) {
  const statusStyle =
    statusConfig[booking.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <div className="md:bg-white md:rounded-3xl md:p-6 md:shadow-sm md:border md:border-gray-200 md:hover:shadow-md md:transition-shadow pb-4 md:pb-0 border-b border-gray-200 md:border-b-0 last:border-b-0">
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        {/* Boat Image */}
        <div className="w-full sm:w-40 h-40 relative overflow-hidden rounded-xl md:rounded-2xl shrink-0">
          <img
            src={booking.image}
            alt={booking.boatName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 md:mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                {booking.boatName}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 capitalize">
                {booking.boatType}
              </p>
            </div>
            <Badge
              className={`ml-2 text-xs ${statusStyle.color} shrink-0 rounded-lg`}
            >
              {statusStyle.label}
            </Badge>
          </div>

          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 shrink-0" />
              <span className="truncate">{booking.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 shrink-0" />
              <span>{booking.duration}h charter</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 shrink-0" />
              <span>
                {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                {booking.captain && " • Captain included"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 shrink-0" />
              <span className="truncate">{booking.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
            <div className="text-base md:text-lg font-semibold text-gray-900">
              {formatCurrency(booking.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Anchor className="h-3 w-3" />
              <span className="hidden sm:inline">
                ID: {booking.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
