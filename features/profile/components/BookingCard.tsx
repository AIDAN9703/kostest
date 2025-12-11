"use client";

import { Badge } from "@/shared/components/ui/badge";
import { CalendarDays, Clock, Users, MapPin, Anchor } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils/general-utils";
import { ProfileBooking } from "@/shared/lib/types/booking.types";

interface BookingCardProps {
  booking: ProfileBooking;
}

const statusConfig = {
  confirmed: { color: "bg-emerald-100 text-emerald-800", label: "Confirmed" },
  approved: { color: "bg-blue-100 text-blue-800", label: "Approved - Awaiting Payment" },
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
  completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
};

export function BookingCard({ booking }: BookingCardProps) {
  const statusStyle = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex">
        {/* Boat Image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 relative overflow-hidden rounded-lg shrink-0">
          <img
            src={booking.image}
            alt={booking.boatName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {booking.boatName}
              </h3>
              <p className="text-xs text-gray-500 capitalize">
                {booking.boatType}
              </p>
            </div>
            <Badge className={`ml-2 text-xs ${statusStyle.color} shrink-0`}>
              {statusStyle.label}
            </Badge>
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span className="truncate">{booking.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{booking.duration}h charter</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>
                {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                {booking.captain && ' • Captain included'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{booking.location}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(booking.price)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Anchor className="h-3 w-3" />
              <span>ID: {booking.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 