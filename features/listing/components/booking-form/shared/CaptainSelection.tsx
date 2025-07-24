"use client";

import { Boat } from "@/shared/types/types";
import { FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { cn } from "@/shared/utils/general-utils";

interface CaptainSelectionProps {
  boat: Boat;
  control: Control<BookingRequest>;
}

export function CaptainSelection({ boat, control }: CaptainSelectionProps) {
  // Don't show if crew is required (captain included)
  if (boat.crewRequired) return null;

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
                "h-10 text-sm font-medium rounded-lg transition-colors border-2",
                !field.value 
                  ? "bg-gold-50 text-gold-700 border-gold-300" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              Self-Drive Charter
            </button>
            <button
              type="button"
              onClick={() => field.onChange(true)}
              className={cn(
                "h-10 text-sm font-medium rounded-lg transition-colors border-2",
                field.value 
                  ? "bg-primary/5 text-primary border-primary/30" 
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