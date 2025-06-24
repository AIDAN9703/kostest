"use client";

import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/lib/validation/validations";

interface SpecialRequestsProps {
  control: Control<BookingRequest>;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SpecialRequests({ control, isExpanded, onToggle }: SpecialRequestsProps) {
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-xs text-navy-600 hover:text-navy-800 py-1.5 text-center border-t border-navy-200 font-medium transition-colors"
      >
        + Add special requests
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <FormLabel className="text-xs font-semibold text-navy-700 uppercase tracking-wide">Special Requests</FormLabel>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs text-coral-600 hover:text-coral-700 w-4 h-4 flex items-center justify-center font-semibold transition-colors"
        >
          ×
        </button>
      </div>
      <FormField
        control={control}
        name="specialRequests"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Any special occasions or requests?"
                className="h-12 resize-none border-navy-200 text-xs rounded focus:border-navy-500 focus:ring-1 focus:ring-navy-200 focus:outline-none bg-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 