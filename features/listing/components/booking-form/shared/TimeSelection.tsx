"use client";

import React, { useEffect, useState } from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { BookingRequest } from "@/features/_validation/validations";
import { TimeSlotsDisplay } from "./TimeSlotsDisplay";
import { createDateTimeISO } from "@/shared/lib/utils/date-helpers";
import { AlarmClockPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils/general-utils";

export function TimeSelection({
  control,
  currentTime,
  boatId,
  selectedDate,
  duration,
  onTimeSelected,
  boat,
}: {
  control: Control<BookingRequest>;
  currentTime: string;
  boatId: string;
  selectedDate: Date | null;
  duration?: number;
  onTimeSelected?: (time: string) => void;
  boat?: { timezone?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return (
    <FormField
      control={control}
      name="startDateTime"
      render={({ field }: any) => (
        <FormItem>
          <div className="w-full border-b border-gray-100 p-4">
            <div className="flex items-center gap-3 w-full">
              {selectedDate ? (
                isMobile ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-3 w-full"
                      onClick={() => setMobileOpen(true)}
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-primary">
                          {currentTime || "Select Start Time"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Choose your start time
                        </div>
                      </div>
                      <AlarmClockPlus className="h-5 w-5 text-primary" />
                    </button>
                    {mobileOpen && (
                      <div
                        className="fixed inset-0 z-1000"
                        role="dialog"
                        aria-modal="true"
                      >
                        <div
                          className="absolute inset-0 bg-black/40"
                          onClick={() => setMobileOpen(false)}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden">
                          <div className="px-4 pt-4 pb-2 border-b">
                            <div className="text-base font-semibold">
                              Start time
                            </div>
                          </div>
                          <div className="p-4 overflow-y-auto max-h-[70vh]">
                            <TimeSlotsDisplay
                              date={selectedDate}
                              boatId={boatId}
                              selectedTime={currentTime}
                              duration={duration}
                              onTimeSelect={(time) => {
                                if (onTimeSelected) {
                                  onTimeSelected(time);
                                } else {
                                  const newDateTimeISO = createDateTimeISO(
                                    selectedDate!,
                                    time,
                                    boat
                                  );
                                  field.onChange(newDateTimeISO);
                                }
                                setMobileOpen(false);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Popover
                    open={open}
                    onOpenChange={(o) => {
                      // Only allow opening when enabled (selectedDate present)
                      setOpen(o);
                      if (o) {
                        const trigger =
                          document?.activeElement as HTMLElement | null;
                        const triggerWidth =
                          trigger?.closest("[data-ts-trigger]")?.clientWidth;
                        if (triggerWidth) {
                          document.documentElement.style.setProperty(
                            "--trigger-width",
                            `${triggerWidth}px`
                          );
                        }
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        data-ts-trigger
                        className="flex items-center gap-3 w-full cursor-pointer"
                      >
                        <div className="flex-1 text-left">
                          <div className="text-sm font-semibold text-primary">
                            {currentTime ? currentTime : "Select Start Time"}
                          </div>
                          <div className="text-xs text-slate-500">
                            Choose your start time
                          </div>
                        </div>
                        <AlarmClockPlus
                          className={cn(
                            "h-5 w-5 text-primary transition-transform",
                            open && "rotate-180"
                          )}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      sideOffset={8}
                      avoidCollisions={false}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                      className="w-(--trigger-width) max-w-[560px] p-4 rounded-xl border border-slate-200 shadow-xs bg-white"
                    >
                      <TimeSlotsDisplay
                        date={selectedDate}
                        boatId={boatId}
                        selectedTime={currentTime}
                        duration={duration}
                        onTimeSelect={(time) => {
                          if (onTimeSelected) {
                            onTimeSelected(time);
                          } else {
                            const newDateTimeISO = createDateTimeISO(
                              selectedDate!,
                              time,
                              boat
                            );
                            field.onChange(newDateTimeISO);
                          }
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )
              ) : (
                <div className="flex items-center gap-3 w-full cursor-not-allowed opacity-50">
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-primary">
                      Select a date first
                    </div>
                    <div className="text-xs text-slate-500">
                      Start time unlocks after selecting date
                    </div>
                  </div>
                  <AlarmClockPlus className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TimeSelection;
