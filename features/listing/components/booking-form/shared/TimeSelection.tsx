"use client";

import { useState } from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { BookingRequest } from "@/features/_validation/validations";
import { TimeSlotsDisplay } from "./TimeSlotsDisplay";
import { createDateTimeISO } from "@/shared/utils/booking-utils";
import { AlarmClockPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils/general-utils";

export function TimeSelection({ 
  control, 
  currentTime, 
  endTime,
  boatId,
  selectedDate,
  duration
}: { 
  control: Control<BookingRequest>; 
  currentTime: string;
  endTime?: string;
  boatId: string;
  selectedDate: Date | null;
  duration?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: any) => (
        <FormItem>
          <div className="w-full border-b border-gray-100 p-4">
            <div className="flex items-center gap-3 w-full">
              <Popover
                open={open}
                onOpenChange={(o) => {
                  setOpen(o);
                  if (o) {
                    // Set the popover width to match trigger width via CSS var
                    const trigger = document?.activeElement as HTMLElement | null;
                    const triggerWidth = trigger?.closest('[data-ts-trigger]')?.clientWidth;
                    if (triggerWidth) {
                      document.documentElement.style.setProperty('--trigger-width', `${triggerWidth}px`);
                    }
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div data-ts-trigger className={cn("flex-1 text-left", selectedDate ? "cursor-pointer" : "cursor-not-allowed opacity-50")}> 
                    <div className="text-sm font-semibold text-primary">
                      {selectedDate ? (currentTime ? currentTime : "Select Start Time") : "Select a date first"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedDate ? "Choose your start time" : "Start time unlocks after selecting date"}
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  avoidCollisions={false}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="w-[var(--trigger-width)] max-w-[560px] p-4 rounded-xl border border-slate-200 shadow-sm bg-white"
                >
                  {selectedDate ? (
                    <TimeSlotsDisplay
                      date={selectedDate}
                      boatId={boatId}
                      selectedTime={currentTime}
                      duration={duration}
                      onTimeSelect={(time) => {
                        const newDateTimeISO = createDateTimeISO(selectedDate, time);
                        field.onChange(newDateTimeISO);
                        setOpen(false);
                      }}
                    />
                  ) : null}
                </PopoverContent>
              </Popover>
              <AlarmClockPlus className={cn("h-7 w-7 text-primary transition-transform", selectedDate && open && "rotate-180")} />
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TimeSelection;

