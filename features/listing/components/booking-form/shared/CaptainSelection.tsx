"use client";

import { Boat } from "@/shared/lib/types/types";
import { FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";
import { cn } from "@/shared/lib/utils/general-utils";

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
                "h-11 text-sm font-medium rounded-xl transition-colors border",
                !field.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              Self-Drive Charter
            </button>
            <button
              type="button"
              onClick={() => field.onChange(true)}
              className={cn(
                "h-11 text-sm font-medium rounded-xl transition-colors border",
                field.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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