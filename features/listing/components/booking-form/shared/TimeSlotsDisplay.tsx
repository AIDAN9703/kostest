"use client";

import { useMemo, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn, formatTime12Hour } from "@/shared/lib/utils/general-utils";
import { useTimeSlots } from "../hooks/useTimeSlots";

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
  duration = 4,
}: TimeSlotsDisplayProps) {
  const { timeSlots, loading } = useTimeSlots({ date, boatId, duration });

  const handleTimeSelect = useCallback(
    (time: string) => onTimeSelect(time),
    [onTimeSelect]
  );

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
            !isSelected &&
              !isDisabled &&
              "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
            isDisabled &&
              "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
          )}
          title={slot.conflictReason}
        >
          {formatTime12Hour(slot.time)}
        </button>
      );
    });
  }, [timeSlots, selectedTime, handleTimeSelect]);

  // Memoized formatted date
  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date),
    [date]
  );

  // Memoized no availability message
  const noAvailabilityMessage = useMemo(() => {
    return timeSlots.every((slot) => !slot.isAvailable);
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
        <div className="text-xs text-slate-500 mt-1">
          All times shown in vessel's <span className="font-bold">local</span>{" "}
          time
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">{timeSlotButtons}</div>
      </div>
      {noAvailabilityMessage && (
        <div className="mt-3 text-sm text-red-600">
          No available time slots for this date. Please select a different date.
        </div>
      )}
    </div>
  );
}
