"use client";

import { Boat } from "@/lib/types/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/general-utils";
import { getBoatDefaultPrice, getBoatDefaultHours } from "@/lib/utils/pricing-utils";
import { useState } from "react";
import BookingFormToggle from "./BookingFormToggle";
import { User } from "next-auth";
import { Sparkles } from "lucide-react";
import Image from "next/image";

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
    <>
      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-navy-200/50 p-3 z-50 sm:hidden shadow-2xl">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Pricing Display */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-navy-900">{price}</span>
              <span className="text-sm text-gray-500 font-medium">/{hours}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">Starting from</span>
          </div>

          {/* Book Button */}
          <Button 
            onClick={() => setOpen(true)} 
            className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Book Now
          </Button>
        </div>
      </div>
      
      {/* Booking Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header with navy gradient */}
          <div className="bg-gradient-to-r from-navy-700 to-navy-800 p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/icons/kosupdatedlogo.webp"
                  alt="KOS Yacht Club"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Book Your Charter
                </DialogTitle>
                <DialogDescription className="text-navy-100 text-sm">
                  {boat.name} • {price}/{hours}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-0">
            <BookingFormToggle boat={boat} user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 