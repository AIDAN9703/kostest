"use client";

import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Control } from "react-hook-form";
import { BookingRequest } from "@/features/_validation/validations";

interface SpecialRequestsProps {
  control: Control<BookingRequest>;
}

export function SpecialRequests({ control }: SpecialRequestsProps) {
  return (
    <FormField
      control={control}
      name="specialRequests"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-gray-900">Special Requests (Optional)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Any special occasions, dietary restrictions, or requests?"
              className="h-16 resize-none border-gray-300 text-sm rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white mt-1"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 