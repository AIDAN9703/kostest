"use client";

import { useState } from "react";
import { Boat } from "@/lib/types/types";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { generateTimeOptions, formatEndTime } from "@/lib/utils/booking-utils";
import { format } from "date-fns";
import { formatTime12Hour } from "@/lib/utils/general-utils";
import { Plus, Minus, Calendar as CalendarIcon, Clock, Users, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/general-utils";

interface BookingDetailsProps {
  boat: Boat;
  control: Control<BookingRequest>;
  setValue: UseFormSetValue<BookingRequest>;
  endTime?: string;
}

export function BookingDetails({ boat, control, setValue, endTime }: BookingDetailsProps) {
  const [dateOpen, setDateOpen] = useState(false);
  
  // Generate time options once
  const timeOptions = generateTimeOptions();
  
  // Only watch passenger count to minimize re-renders
  const numberOfPassengers = useWatch({
    control,
    name: "numberOfPassengers",
    defaultValue: 1
  });

  return (
    <div className="space-y-3">
      {/* Date Selection */}
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border border-gray-300 rounded-lg p-3 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors h-auto"
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
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0" 
                align="start"
                side="bottom"
                sideOffset={8}
              >
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setDateOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="p-4"
                  classNames={{
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-base font-semibold",
                    nav_button: "h-8 w-8",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    head_cell: "text-gray-500 w-10 h-8 font-medium text-xs flex items-center justify-center",
                    day: "h-10 w-10 rounded-md hover:bg-gray-100 transition-colors",
                    day_selected: "bg-primary text-white",
                    day_today: "text-gold font-semibold",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-300 opacity-30 cursor-not-allowed hover:bg-transparent",
                  }}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Time Selection */}
      <FormField
        control={control}
        name="startTime"
        render={({ field }) => (
          <FormItem>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-white border border-gray-300 rounded-lg p-3 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors h-auto">
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

      {/* Passengers Counter */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {numberOfPassengers} {numberOfPassengers === 1 ? "Passenger" : "Passengers"}
              </div>
              <div className="text-xs text-gray-500">
                Up to {boat.capacity || 10} allowed
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setValue("numberOfPassengers", Math.max(1, numberOfPassengers - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
              disabled={numberOfPassengers <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
              {numberOfPassengers}
            </span>
            <button
              type="button"
              onClick={() => {
                if (numberOfPassengers < (boat.capacity || 10)) setValue("numberOfPassengers", numberOfPassengers + 1);
              }}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={numberOfPassengers >= (boat.capacity || 10)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 