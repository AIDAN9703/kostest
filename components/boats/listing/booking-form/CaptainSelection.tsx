"use client";

import { Boat } from "@/lib/types/types";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";
import { cn } from "@/lib/utils/general-utils";

interface CaptainSelectionProps {
  boat: Boat;
  control: Control<BookingRequest>;
}

export function CaptainSelection({ boat, control }: CaptainSelectionProps) {
  // Don't show if crew is required (captain included)
  if (boat.crewRequired) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
      <FormField
        control={control}
        name="needsCaptain"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide mb-1 block">Captain Service</FormLabel>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => field.onChange(false)}
                className={cn(
                  "h-8 text-xs font-semibold rounded transition-all duration-200",
                  !field.value 
                    ? "bg-navy-600 text-white shadow-md hover:bg-navy-700" 
                    : "bg-white text-gray-700 border border-navy-200 hover:border-navy-400 hover:bg-navy-50"
                )}
              >
                Self-Drive
              </button>
              <button
                type="button"
                onClick={() => field.onChange(true)}
                className={cn(
                  "h-8 text-xs font-semibold rounded transition-all duration-200",
                  field.value 
                    ? "bg-coral-500 text-white shadow-md hover:bg-coral-600" 
                    : "bg-white text-gray-700 border border-coral-200 hover:border-coral-400 hover:bg-coral-50"
                )}
              >
                + Captain ($100)
              </button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 