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

  // Memoized time slots generation
  const generateTimeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        isAvailable: true
      });
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
            const [hours] = slot.time.split(':').map(Number);
            const slotStart = new Date(date);
            slotStart.setHours(hours, 0, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hours + duration, 0, 0, 0); // Use actual duration from pricing tier

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

  // Memoized time slot buttons
  const timeSlotButtons = useMemo(() => {
    return timeSlots.map((slot) => (
      <Button
        key={slot.time}
        type="button"
        variant={selectedTime === slot.time ? "default" : "outline"}
        size="sm"
        disabled={!slot.isAvailable}
        onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
        className={cn(
          "text-xs",
          !slot.isAvailable && "opacity-50 cursor-not-allowed"
        )}
        title={slot.conflictReason}
      >
        {formatTime12Hour(slot.time)}
      </Button>
    ));
  }, [timeSlots, selectedTime, handleTimeSelect]);

  // Memoized formatted date
  const formattedDate = useMemo(() => format(date, 'MMM d, yyyy'), [date]);

  // Memoized no availability message
  const noAvailabilityMessage = useMemo(() => {
    return timeSlots.every(slot => !slot.isAvailable);
  }, [timeSlots]);

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Loading available times...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          Available times for {formattedDate}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {timeSlotButtons}
      </div>
      
      {noAvailabilityMessage && (
        <div className="mt-3 text-sm text-red-600">
          No available time slots for this date. Please select a different date.
        </div>
      )}
    </div>
  );
} 