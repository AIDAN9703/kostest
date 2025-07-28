"use client";

import { useState } from "react";
import { Boat } from "@/shared/types/types";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Control, UseFormSetValue } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { generateTimeOptions, formatEndTime, createDateTimeISO } from "@/shared/utils/booking-utils";
import { format } from "date-fns";
import { formatTime12Hour } from "@/shared/utils/general-utils";
import { Plus, Minus, Calendar as CalendarIcon, Clock, Users, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/general-utils";

// Individual field components for better organization
export function DateSelection({ 
  control, 
  currentDate 
}: { 
  control: Control<BookingRequest>; 
  currentDate: Date | null;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }) => (
        <FormItem>
          <div className="relative">
            <Button
              type="button"
              onClick={() => setDateOpen(!dateOpen)}
              variant="outline"
              className="w-full border border-gray-300 rounded-lg p-3 h-auto"
            >
              <div className="flex items-center gap-3 w-full">
                <CalendarIcon className="h-5 w-5 text-primary" />
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 justify-center flex">
                <Calendar
                  mode="single"
                  selected={currentDate || undefined}
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="p-3"
                  classNames={{
                    day: "h-8 w-8 rounded-md hover:bg-gray-100 transition-colors",
                    day_selected: "bg-primary text-white",
                    day_today: "text-gold font-semibold",
                    day_disabled: "text-gray-300 opacity-30 cursor-not-allowed hover:bg-transparent",
                  }}
                />
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TimeSelection({ 
  control, 
  currentTime, 
  endTime 
}: { 
  control: Control<BookingRequest>; 
  currentTime: string;
  endTime?: string;
}) {
  const timeOptions = generateTimeOptions();
  
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }) => (
        <FormItem>
          <Select 
            onValueChange={(time) => {
              // Get current date from field value or use today
              const currentDateTime = field.value ? new Date(field.value) : new Date();
              
              // Create new ISO string with current date and selected time
              // This properly converts from user's local timezone to UTC
              const newDateTimeISO = createDateTimeISO(currentDateTime, time);
              field.onChange(newDateTimeISO);
            }} 
            value={currentTime}
          >
            <SelectTrigger className="w-full border border-gray-300 rounded-lg p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentTime ? formatTime12Hour(currentTime) : "Select Start Time"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {endTime ? `Ends at ${formatEndTime(endTime)}` : "Choose departure time"}
                  </div>
                </div>
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {timeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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