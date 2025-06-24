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
    <FormField
      control={control}
      name="needsCaptain"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-900 block mb-2">Captain Service</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => field.onChange(false)}
              className={cn(
                "h-10 text-sm font-medium rounded-lg transition-all duration-200 border-2",
                !field.value 
                  ? "bg-gold-50 text-gold-700 border-gold-300 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              Self-Drive Charter
            </button>
            <button
              type="button"
              onClick={() => field.onChange(true)}
              className={cn(
                "h-10 text-sm font-medium rounded-lg transition-all duration-200 border-2",
                field.value 
                  ? "bg-coral-50 text-coral-700 border-coral-300 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              Captain Included
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 