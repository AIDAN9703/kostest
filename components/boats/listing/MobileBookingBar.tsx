"use client";

import { Boat } from "@/lib/types/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/general-utils";
import { getBoatDefaultPrice, getBoatDefaultHours } from "@/lib/utils/pricing-utils";
import { useState } from "react";
import BookingFormToggle from "./BookingFormToggle";
import { User } from "next-auth";

interface MobileBookingBarProps {
  boat: Boat;
  user?: User;
}

export function MobileBookingBar({ boat, user }: MobileBookingBarProps) {
  const [open, setOpen] = useState(false);

  // Get pricing display using utility functions
  const price = formatCurrency(getBoatDefaultPrice(boat));
  const hours = getBoatDefaultHours(boat);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-50 sm:hidden">
      <div>
        <p className="text-xl font-semibold">
          {price}<span className="text-sm text-gray-500">/{hours}</span>
        </p>
      </div>
      <Button onClick={() => setOpen(true)} className="text-white">
        Book Now
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 gap-0">
          <DialogTitle className="px-6 pt-6 pb-2">
            Book this boat
          </DialogTitle>
          <DialogDescription className="px-6">
            Complete your booking details
          </DialogDescription>
          <div className="px-6 pb-6 pt-2">
            <BookingFormToggle boat={boat} user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 