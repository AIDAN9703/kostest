"use client";

import { PricingTier } from "@/shared/types/types";
import { CalendarIcon, UsersIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";
import { formatDate, formatTime12Hour } from "@/shared/utils/general-utils";
import { parseISODateTimeInBoatTimezone } from "@/shared/utils/booking-utils";

// Safe boat data interface - only includes necessary and safe properties
interface SafeBoatData {
  id: string;
  name: string;
  mainImage: string | null;
  instantBook: boolean;
  cleaningFee: number | null;
  locationLabel: string | null;
  timezone?: string | null; // Need timezone for proper boat time display
}

interface BookingSummaryProps {
  boat: SafeBoatData;
  selectedTier: PricingTier | null;
  bookingData: {
    startDateTime: string | null;
    numberOfPassengers: number;
  };
}

export default function BookingSummary({ 
  boat, 
  bookingData, 
  selectedTier, 
}: BookingSummaryProps) {
  // Format date and time for display in BOAT's timezone (consistent with "vessel's local time")
  const formatBookingDateTime = () => {
    if (!bookingData.startDateTime) return { date: 'TBD', time: 'TBD' };
    
    // Parse in boat's timezone to match the "vessel's local time" promise
    const { date: boatDate, time: boatTime } = parseISODateTimeInBoatTimezone(
      bookingData.startDateTime, 
      boat
    );
    
    if (!boatDate) return { date: 'TBD', time: 'TBD' };
    
    const date = formatDate(boatDate);
    const time = formatTime12Hour(boatTime);
    
    return { date, time };
  };

  const { date, time } = formatBookingDateTime();
  const partySize = `${bookingData.numberOfPassengers} ${bookingData.numberOfPassengers === 1 ? 'person' : 'people'}`;
  const charterDuration = selectedTier ? `(${selectedTier.hours} hour charter)` : '';

  return (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4">
        <div className="shrink-0 self-center sm:self-start">
          <img 
            src={boat.mainImage || '/images/boats/default-boat.jpg'} 
            alt={boat.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-1">{boat.name}</h2>
          
          {/* Mobile: 2-column grid layout, Desktop: Horizontal flow */}
          <div className="space-y-2">
            {/* Main booking details in 2-column grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:flex sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 
                <span className="truncate font-medium">{date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 
                <span className="truncate font-medium">{time}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> 
                <span className="truncate">{partySize}</span>
              </span>
              {charterDuration && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="truncate text-xs">{charterDuration}</span>
                </span>
              )}
            </div>
            
            {/* Location as a separate, full-width row */}
            {boat.locationLabel && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 pt-1">
                <span className="text-sm">📍</span>
                <span className="truncate">{boat.locationLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
  );
} 