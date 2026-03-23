"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils/general-utils";
import { createDateTimeISO } from "@/shared/lib/utils/date-helpers";
import { BookingRequest } from "@/features/_validation/validations";
import { CustomCalendar } from "./CustomCalendar";
import type { BookingPickerLayout } from "./booking-picker-layout";

export function DateSelection({
  control,
  currentDate,
  boatId,
  onDateSelected,
  boat,
  layout = "popover",
}: {
  control: Control<BookingRequest>;
  currentDate: Date | null;
  boatId: string;
  onDateSelected?: (date: Date) => void;
  boat?: { timezone?: string | null };
  layout?: BookingPickerLayout;
}) {
  const [dateOpen, setDateOpen] = useState(false);

  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: { field: { onChange: (v: string) => void } }) => (
        <FormItem>
          <div className="w-full border-b border-gray-100 p-4">
            {layout === "inline" ? (
              <div className="w-full">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-3 text-left"
                  onClick={() => setDateOpen((o) => !o)}
                  aria-expanded={dateOpen}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-primary">
                      {currentDate ? format(currentDate, "MMMM d, yyyy") : "Select date"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {currentDate ? format(currentDate, "EEEE") : "Choose your charter date"}
                    </div>
                  </div>
                  <Calendar
                    className={cn(
                      "h-5 w-5 shrink-0 text-primary transition-transform",
                      dateOpen && "rotate-180"
                    )}
                  />
                </button>
                {dateOpen && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm">
                    <CustomCalendar
                      selectedDate={currentDate}
                      onSelect={(date) => {
                        if (date) {
                          if (onDateSelected) {
                            onDateSelected(date);
                          } else {
                            const currentTime = currentDate ? format(currentDate, "HH:mm") : "09:00";
                            const newDateTimeISO = createDateTimeISO(date, currentTime, boat);
                            field.onChange(newDateTimeISO);
                          }
                        }
                        setDateOpen(false);
                      }}
                      boatId={boatId}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex w-full items-center gap-3">
                <Popover open={dateOpen} onOpenChange={setDateOpen} modal>
                  <PopoverTrigger asChild>
                    <button type="button" className="flex w-full cursor-pointer items-center gap-3">
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-sm font-semibold text-primary">
                          {currentDate ? format(currentDate, "MMMM d, yyyy") : "Select Date"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {currentDate ? format(currentDate, "EEEE") : "Choose your charter date"}
                        </div>
                      </div>
                      <Calendar
                        className={cn(
                          "h-5 w-5 shrink-0 text-primary transition-transform",
                          dateOpen && "rotate-180"
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className="w-auto rounded-3xl border-0 p-0 shadow-none"
                  >
                    <CustomCalendar
                      selectedDate={currentDate}
                      onSelect={(date) => {
                        if (date) {
                          if (onDateSelected) {
                            onDateSelected(date);
                          } else {
                            const currentTime = currentDate ? format(currentDate, "HH:mm") : "09:00";
                            const newDateTimeISO = createDateTimeISO(date, currentTime, boat);
                            field.onChange(newDateTimeISO);
                          }
                        }
                        setDateOpen(false);
                      }}
                      boatId={boatId}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default DateSelection;
