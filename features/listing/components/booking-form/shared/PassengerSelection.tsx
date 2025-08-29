"use client";

import { Control, UseFormSetValue } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Users, Plus, Minus } from "lucide-react";
import { BookingRequest } from "@/features/_validation/validations";
import { Boat } from "@/shared/types/types";

export function PassengerSelection({ 
  boat, 
  control, 
  setValue,
  show = true
}: { 
  boat: Boat; 
  control: Control<BookingRequest>; 
  setValue: UseFormSetValue<BookingRequest>;
  show?: boolean;
}) {
  const handlePassengerChange = (increment: boolean, currentValue: number) => {
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    const maxPassengers = boat.capacity || 12;
    if (newValue >= 1 && newValue <= maxPassengers) {
      setValue("numberOfPassengers", newValue);
    }
  };

  if (!show) return null;

  return (
    <FormField
      control={control}
      name="numberOfPassengers"
      render={({ field }) => (
        <FormItem>
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Passengers</div>
                <div className="text-xs text-gray-500">How many guests (max {boat.capacity || 12})</div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-hidden focus:ring-0"
                  onClick={() => handlePassengerChange(false, field.value)}
                  disabled={field.value <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[2ch] text-center text-gray-900">{field.value}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-hidden focus:ring-0"
                  onClick={() => handlePassengerChange(true, field.value)}
                  disabled={field.value >= (boat.capacity || 12)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default PassengerSelection;

