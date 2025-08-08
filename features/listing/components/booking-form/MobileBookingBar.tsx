"use client";

import { Boat } from "@/shared/types/types";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { formatCurrency } from "@/shared/utils/general-utils";
import { getBoatDefaultPrice, getBoatDefaultHours } from "@/shared/utils/pricing-utils";
import { useState } from "react";
import { RequestBookingForm, InstantBookingForm } from ".";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

interface MobileBookingBarProps {
  boat: Boat;
}

export function MobileBookingBar({ boat }: MobileBookingBarProps) {
  const { data: session } = useSession();
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
            <DialogTitle className="text-lg text-center font-bold text-primary p-4">Book Your Charter</DialogTitle>

          {/* Form Content */}
          <div className="p-4">
            {boat.instantBook ? (
              <InstantBookingForm boat={boat} />
            ) : (
              <RequestBookingForm boat={boat} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 