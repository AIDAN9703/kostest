"use client";

import { useState } from "react";
import { Boat } from "@/lib/types/types";
import { FormField, FormItem, FormMessage, FormControl } from "@/components/ui/form";
import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { generateTimeOptions, formatEndTime } from "@/lib/utils/booking-utils";
import { format } from "date-fns";
import { cn, formatTime12Hour } from "@/lib/utils/general-utils";
import { Plus, Minus, Calendar, Clock, Users, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface BookingDetailsProps {
  boat: Boat;
  control: Control<BookingRequest>;
  setValue: UseFormSetValue<BookingRequest>;
  endTime?: string;
}

export function BookingDetails({ boat, control, setValue, endTime }: BookingDetailsProps) {
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const timeOptions = generateTimeOptions();

  // Use useWatch for optimal performance - only re-renders when this specific field changes
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
            <button
              type="button"
              onClick={() => setDateModalOpen(true)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 hover:border-coral-400 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-coral-500" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {field.value ? format(field.value, "MMMM d, yyyy") : "Select Date"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {field.value ? format(field.value, "EEEE") : "Choose your charter date"}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
                  Select Charter Date
                </DialogTitle>
                <FormControl>
                  <input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        field.onChange(new Date(e.target.value));
                        setDateModalOpen(false);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full h-12 px-4 text-sm border border-gray-300 rounded-lg focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 focus:outline-none bg-white"
                  />
                </FormControl>
              </DialogContent>
            </Dialog>
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
            <button
              type="button"
              onClick={() => setTimeModalOpen(true)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 hover:border-coral-400 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-coral-500" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {field.value ? formatTime12Hour(field.value) : "Select Start Time"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {endTime ? `Ends at ${formatEndTime(endTime)}` : "Choose departure time"}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            <Dialog open={timeModalOpen} onOpenChange={setTimeModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
                  Select Start Time
                </DialogTitle>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {timeOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        field.onChange(option.value);
                        setTimeModalOpen(false);
                      }}
                      className={cn(
                        "p-3 rounded-lg border text-center transition-all duration-200",
                        field.value === option.value
                          ? "border-coral-500 bg-coral-50"
                          : "border-gray-200 hover:border-coral-300 hover:bg-gray-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Passengers Counter - Optimized with useWatch */}
      <div className="bg-white border border-gray-300 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-coral-500" />
            <div className="text-left">
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
              onClick={() => {
                if (numberOfPassengers > 1) setValue("numberOfPassengers", numberOfPassengers - 1);
              }}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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