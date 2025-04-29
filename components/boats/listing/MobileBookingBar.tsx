"use client";

import { Boat } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/general-utils";
import { useState } from "react";
import BookingFormToggle from "./BookingFormToggle";
import { User } from "next-auth";

interface MobileBookingBarProps {
  boat: Boat;
  user?: User;
}

export function MobileBookingBar({ boat, user }: MobileBookingBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(calc(100%-2rem),500px)]  max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">
            Book {boat.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Book this boat charter with instant booking or send a booking request
          </DialogDescription>
          <BookingFormToggle boat={boat} user={user} />
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(boat.hourlyRate || 0)}<span className="text-sm font-normal text-gray-600">+/hr</span>
            </span>
            <span className="text-sm font-normal text-gray-600">(excl. fees)</span>
          </div>
          <Button 
            size="lg"
            className="px-8 text-white"
            onClick={() => setOpen(true)}
          >
            Book Now
          </Button>
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
      </div>
    </>
  );
} 