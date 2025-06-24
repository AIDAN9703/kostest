"use client";

import { Boat } from "@/lib/types/types";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { generateTimeOptions, formatEndTime } from "@/lib/utils/booking-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils/general-utils";

interface BookingDetailsProps {
  boat: Boat;
  control: Control<BookingRequest>;
  getValues: UseFormGetValues<BookingRequest>;
  setValue: UseFormSetValue<BookingRequest>;
  endTime?: string;
}

export function BookingDetails({ boat, control, getValues, setValue, endTime }: BookingDetailsProps) {
  const timeOptions = generateTimeOptions();

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
      <div className="space-y-2">
        {/* Date & Time in One Row */}
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1">Date</FormLabel>
                <FormControl>
                  <input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        field.onChange(new Date(e.target.value));
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full h-8 px-2 text-sm border border-navy-200 rounded focus:border-navy-500 focus:ring-1 focus:ring-navy-200 focus:outline-none bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1">Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 border-navy-200 text-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-200">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
        </div>

        {/* Passengers - Enhanced Counter */}
        <div>
          <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1 block">Passengers</FormLabel>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50/30 rounded border border-navy-200 px-2 py-1.5">
            <button
              type="button"
              onClick={() => {
                const current = getValues("numberOfPassengers");
                if (current > 1) setValue("numberOfPassengers", current - 1);
              }}
              className="w-7 h-7 rounded-full border border-navy-300 bg-white flex items-center justify-center hover:bg-navy-50 hover:border-navy-400 text-navy-600 text-sm font-semibold transition-colors"
            >
              −
            </button>
            <span className="font-semibold text-navy-900 text-xs">
              {getValues("numberOfPassengers")} {getValues("numberOfPassengers") === 1 ? "passenger" : "passengers"}
            </span>
            <button
              type="button"
              onClick={() => {
                const current = getValues("numberOfPassengers");
                if (current < (boat.capacity || 10)) setValue("numberOfPassengers", current + 1);
              }}
              className="w-7 h-7 rounded-full border border-navy-300 bg-white flex items-center justify-center hover:bg-navy-50 hover:border-navy-400 text-navy-600 text-sm font-semibold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* End time display - Enhanced */}
        {endTime && (
          <div className="text-xs text-coral-700 bg-coral-50 px-2 py-1 rounded text-center border border-coral-200 font-medium">
            ⛵ Ends at {formatEndTime(endTime)}
          </div>
        )}
      </div>
    </div>
  );
} 