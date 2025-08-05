"use client";

import { useState } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Calendar, ChevronDown, Clock, Users, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { cn, formatTime12Hour } from "@/shared/utils/general-utils";
import { createDateTimeISO } from "@/shared/utils/booking-utils";
import { BookingRequest } from "@/features/_validation/validations";
import { Boat } from "@/shared/types/types";
import { CustomCalendar } from "./CustomCalendar";
import { CalendarLegend } from "./CalendarLegend";
import { TimeSlotsDisplay } from "./TimeSlotsDisplay";

// Individual field components for better organization
export function DateSelection({ 
  control, 
  currentDate,
  boatId
}: { 
  control: Control<BookingRequest>; 
  currentDate: Date | null;
  boatId: string;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: any) => (
        <FormItem>
          <div className="relative">
            <Button
              type="button"
              onClick={() => setDateOpen(!dateOpen)}
              variant="outline"
              className="w-full border border-gray-300 rounded-lg p-3 h-auto"
            >
              <div className="flex items-center gap-3 w-full">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentDate ? format(currentDate, "MMMM d, yyyy") : "Select Date"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentDate ? format(currentDate, "EEEE") : "Choose your charter date"}
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  dateOpen && "rotate-180"
                )} />
              </div>
            </Button>
            
            {dateOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <CustomCalendar
                    selectedDate={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        // Get current time from existing startDateTime or default to 09:00
                        const currentTime = currentDate ? format(currentDate, "HH:mm") : "09:00";
                        
                        // Create new ISO string with selected date and current/default time
                        // This properly converts from user's local timezone to UTC
                        const newDateTimeISO = createDateTimeISO(date, currentTime);
                        field.onChange(newDateTimeISO);
                      }
                      setDateOpen(false);
                    }}
                    boatId={boatId}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Calendar legend */}
          <CalendarLegend />
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TimeSelection({ 
  control, 
  currentTime, 
  endTime,
  boatId,
  selectedDate,
  duration
}: { 
  control: Control<BookingRequest>; 
  currentTime: string;
  endTime?: string;
  boatId: string;
  selectedDate: Date | null;
  duration?: number;
}) {
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: any) => (
        <FormItem>
          {selectedDate ? (
            <TimeSlotsDisplay
              date={selectedDate}
              boatId={boatId}
              selectedTime={currentTime}
              duration={duration}
              onTimeSelect={(time) => {
                // Create new ISO string with selected date and time
                const newDateTimeISO = createDateTimeISO(selectedDate, time);
                field.onChange(newDateTimeISO);
              }}
            />
          ) : (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Please select a date first</span>
              </div>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function PassengerSelection({ 
  boat, 
  control, 
  setValue 
}: { 
  boat: Boat; 
  control: Control<BookingRequest>; 
  setValue: UseFormSetValue<BookingRequest>; 
}) {

  const handlePassengerChange = (increment: boolean, currentValue: number) => {
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    const maxPassengers = boat.capacity || 12;
    
    if (newValue >= 1 && newValue <= maxPassengers) {
      setValue("numberOfPassengers", newValue);
    }
  };

  return (
    <FormField
      control={control}
      name="numberOfPassengers"
      render={({ field }) => (
        <FormItem>
          <div className="border border-gray-300 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Passengers</div>
                <div className="text-xs text-gray-500">
                  How many guests (max {boat.capacity || 12})
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => handlePassengerChange(false, field.value)}
                  disabled={field.value <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2ch] text-center">
                  {field.value}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => handlePassengerChange(true, field.value)}
                  disabled={field.value >= (boat.capacity || 12)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}