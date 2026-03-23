"use client";

import { Boat } from "@/shared/lib/types/types";
import { PricingTier } from "@/shared/lib/types/types";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { getBoatStartingHourlyLabel } from "@/shared/lib/utils/pricing-utils";
import { useState } from "react";
import { RequestBookingForm, InstantBookingForm } from ".";
import { CalendarCheck, ChevronUp, X } from "lucide-react";
import { BoatWithTiers } from "@/features/boats/boat.types";
import { cn } from "@/shared/lib/utils/general-utils";

type BoatWithPricingTiers = Boat & {
  pricingTiers?: PricingTier[] | null;
  hourlyRate?: number | null;
};

interface MobileBookingBarProps {
  boat: BoatWithPricingTiers;
}

export function MobileBookingBar({ boat }: MobileBookingBarProps) {
  const [open, setOpen] = useState(false);
  const startingHourly = getBoatStartingHourlyLabel(boat as BoatWithTiers);

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 md:hidden",
          "border-t border-border bg-card/95 text-card-foreground",
          "shadow-[0_-10px_40px_-10px_rgba(15,23,42,0.18)] backdrop-blur-md",
          "px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
          open && "pointer-events-none translate-y-full opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Starting at
            </p>
            <p className="truncate text-lg font-bold leading-tight tracking-tight text-foreground">
              {startingHourly}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="h-12 shrink-0 gap-2 rounded-2xl px-5 text-base font-semibold shadow-md"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="boat-booking-drawer"
          >
            <CalendarCheck className="size-5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Book now</span>
            <span className="sm:hidden">Book</span>
            <ChevronUp
              className={cn(
                "size-4 shrink-0 opacity-80 transition-transform duration-300",
                open && "-rotate-180"
              )}
              aria-hidden
            />
          </Button>
        </div>
      </div>

      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerContent
          id="boat-booking-drawer"
          className="flex max-h-[92dvh] flex-col gap-0 px-0 pb-[env(safe-area-inset-bottom)]"
        >
          <DrawerHeader className="relative shrink-0 space-y-1 border-b border-border px-5 pb-4 pt-1 text-left">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-0 h-11 w-11 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Close booking"
              >
                <X className="size-5" strokeWidth={2} />
              </Button>
            </DrawerClose>
            <DrawerTitle className="pr-14 text-left text-xl font-bold leading-snug tracking-tight text-foreground">
              Book your charter
            </DrawerTitle>
            <DrawerDescription className="text-left text-base leading-snug text-muted-foreground">
              {boat.name}
            </DrawerDescription>
          </DrawerHeader>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-label="Booking form"
          >
            {boat.instantBook ? (
              <InstantBookingForm boat={boat} pickerLayout="inline" />
            ) : (
              <RequestBookingForm boat={boat} pickerLayout="inline" />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
