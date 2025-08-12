"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils/general-utils";
import { createDateTimeISO } from "@/shared/utils/booking-utils";
import { BookingRequest } from "@/features/_validation/validations";
import { CustomCalendar } from "./CustomCalendar";

export function DateSelection({ 
  control, 
  currentDate,
  boatId,
  onDateSelected,
}: { 
  control: Control<BookingRequest>; 
  currentDate: Date | null;
  boatId: string;
  onDateSelected?: (date: Date) => void;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: any) => (
        <FormItem>
          <div className="w-full border-b border-gray-100 p-4">
            <div className="flex items-center gap-3 w-full">
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-3 w-full cursor-pointer">
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-primary">
                        {currentDate ? format(currentDate, "MMMM d, yyyy") : "Select Date"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {currentDate ? format(currentDate, "EEEE") : "Choose your charter date"}
                      </div>
                    </div>
                    <Calendar className={cn("h-5 w-5 text-primary transition-transform", dateOpen && "rotate-180")} />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  avoidCollisions={false}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="w-auto p-0 rounded-3xl border-0 shadow-none"
                >
                  <CustomCalendar
                    selectedDate={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        if (onDateSelected) {
                          onDateSelected(date);
                        } else {
                          const currentTime = currentDate ? format(currentDate, "HH:mm") : "09:00";
                          const newDateTimeISO = createDateTimeISO(date, currentTime);
                          field.onChange(newDateTimeISO);
                        }
                      }
                      setDateOpen(false);
                    }}
                    boatId={boatId}
                  />
                </PopoverContent>
              </Popover>
              {/* icon moved into trigger above */}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default DateSelection;

