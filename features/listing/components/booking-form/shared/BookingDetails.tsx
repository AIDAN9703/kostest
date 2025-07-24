"use client";

import { useState } from "react";
import { Boat } from "@/shared/types/types";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { generateTimeOptions, formatEndTime } from "@/shared/utils/booking-utils";
import { format } from "date-fns";
import { formatTime12Hour } from "@/shared/utils/general-utils";
import { Plus, Minus, Calendar as CalendarIcon, Clock, Users, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/general-utils";



// Individual field components for better organization
export function DateSelection({ control }: { control: Control<BookingRequest> }) {
  const [dateOpen, setDateOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name="startDate"
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
                    {field.value ? format(field.value, "MMMM d, yyyy") : "Select Date"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {field.value ? format(field.value, "EEEE") : "Choose your charter date"}
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
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
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

export function TimeSelection({ control, endTime }: { control: Control<BookingRequest>; endTime?: string }) {
  const timeOptions = generateTimeOptions();
  
  return (
    <FormField
      control={control}
      name="startTime"
      render={({ field }) => (
        <FormItem>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger className="w-full border border-gray-300 rounded-lg p-3 h-auto">
              <div className="flex items-center gap-3 w-full">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {field.value ? formatTime12Hour(field.value) : "Select Start Time"}
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

export function PassengerSelection({ boat, control, setValue }: { boat: Boat; control: Control<BookingRequest>; setValue: UseFormSetValue<BookingRequest> }) {
  const numberOfPassengers = useWatch({
    control,
    name: "numberOfPassengers",
    defaultValue: 1
  });

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-700">
              {numberOfPassengers} {numberOfPassengers === 1 ? "Passenger" : "Passengers"}
            </div>
            <div className="text-xs text-gray-500">
              Up to {boat.capacity || 10} allowed (optional)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
                     <button
             type="button"
             onClick={() => setValue("numberOfPassengers", Math.max(1, numberOfPassengers - 1))}
             className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
             disabled={numberOfPassengers <= 1}
           >
             <Minus className="h-3 w-3" />
           </button>
           <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
             {numberOfPassengers}
           </span>
           <button
             type="button"
             onClick={() => {
               if (numberOfPassengers < (boat.capacity || 10)) setValue("numberOfPassengers", numberOfPassengers + 1);
             }}
             className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
             disabled={numberOfPassengers >= (boat.capacity || 10)}
           >
             <Plus className="h-3 w-3" />
           </button>
        </div>
      </div>
    </div>
  );
}