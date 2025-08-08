"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn, formatTime12Hour } from "@/shared/utils/general-utils";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  conflictReason?: string;
}

interface TimeSlotsDisplayProps {
  date: Date;
  boatId: string;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  duration?: number; // Duration in hours from pricing tier
}

export function TimeSlotsDisplay({ 
  date, 
  boatId, 
  selectedTime, 
  onTimeSelect,
  duration = 4 // Default to 4 hours if not provided
}: TimeSlotsDisplayProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Memoized time slots generation (every 30 minutes)
  const generateTimeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    // Broader window similar to Boatsetter: 6:00 AM → 8:00 PM
    for (let hour = 6; hour <= 20; hour++) {
      const hh = hour.toString().padStart(2, '0');
      // :00
      slots.push({ time: `${hh}:00`, isAvailable: true });
      // :30 (not after the last hour to keep bounds similar to before)
      if (hour < 20) {
        slots.push({ time: `${hh}:30`, isAvailable: true });
      }
    }
    return slots;
  }, []);

  // Memoized date key for dependency tracking
  const dateKey = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

  // Memoized onTimeSelect callback
  const handleTimeSelect = useCallback((time: string) => {
    onTimeSelect(time);
  }, [onTimeSelect]);

  // Check availability for the selected date
  useEffect(() => {
    if (!date || !boatId) return;

    const checkAvailability = async () => {
      setLoading(true);
      try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/boats/${boatId}/availability?` +
          `startDate=${startDate.toISOString()}&` +
          `endDate=${endDate.toISOString()}`
        );

        if (response.ok) {
          const availability = await response.json();
          
          // Update slots based on availability
          const updatedSlots = generateTimeSlots.map(slot => {
            const [hoursStr, minutesStr] = slot.time.split(':');
            const hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            const slotStart = new Date(date);
            slotStart.setHours(hours, minutes, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hours + duration, minutes, 0, 0); // Use actual duration from pricing tier

            const hasConflict = availability.conflicts.some((conflict: any) => {
              const conflictStart = new Date(conflict.startTime);
              const conflictEnd = new Date(conflict.endTime);
              return (
                (slotStart < conflictEnd && slotEnd > conflictStart) ||
                (conflictStart < slotEnd && conflictEnd > slotStart)
              );
            });

            return {
              ...slot,
              isAvailable: !hasConflict,
              conflictReason: hasConflict ? "Time slot unavailable" : undefined
            };
          });

          setTimeSlots(updatedSlots);
        } else {
          setTimeSlots(generateTimeSlots);
        }
      } catch (error) {
        console.error('Failed to check availability:', error);
        setTimeSlots(generateTimeSlots);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [dateKey, boatId, generateTimeSlots, duration]);

  // Render all options (available and unavailable) as clean cards
  const timeSlotButtons = useMemo(() => {
    return timeSlots.map((slot) => {
      const isSelected = selectedTime === slot.time;
      const isDisabled = !slot.isAvailable;
      return (
        <button
          key={slot.time}
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && handleTimeSelect(slot.time)}
          className={cn(
            "h-12 w-full rounded-lg border text-sm font-medium transition-colors",
            isSelected && "bg-blue-50 border-blue-200 text-blue-700",
            !isSelected && !isDisabled && "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            isDisabled && "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
          )}
          title={slot.conflictReason}
        >
          {formatTime12Hour(slot.time)}
        </button>
      );
    });
  }, [timeSlots, selectedTime, handleTimeSelect]);

  // Memoized formatted date
  const formattedDate = useMemo(() => format(date, 'MMM d, yyyy'), [date]);

  // Memoized no availability message
  const noAvailabilityMessage = useMemo(() => {
    return timeSlots.every(slot => !slot.isAvailable);
  }, [timeSlots]);

  if (loading) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Loading available times...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-3 rounded-md bg-slate-50 text-slate-600 text-sm px-4 py-2 text-center">
        Times shown reflect current availability.
      </div>
      <div className="max-h-72 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          {timeSlotButtons}
        </div>
      </div>
      {noAvailabilityMessage && (
        <div className="mt-3 text-sm text-red-600">
          No available time slots for this date. Please select a different date.
        </div>
      )}
    </div>
  );
} 