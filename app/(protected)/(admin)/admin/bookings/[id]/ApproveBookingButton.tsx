"use client";

import { Button } from "@/shared/components/ui/button";
import { approveBookingRequest } from "@/features/bookings/actions/admin-booking-actions";
import { useToast } from "@/shared/hooks/use-toast";
import { useState } from "react";

interface ApproveBookingButtonProps {
  bookingId: string;
}

export function ApproveBookingButton({ bookingId }: ApproveBookingButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await approveBookingRequest(bookingId);
      if (result.success) {
        toast({
          title: "Booking Approved",
          description: result.message,
        });
        // revalidatePath in server action handles refresh
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleApprove} disabled={isLoading}>
      {isLoading ? "Approving..." : "Approve Booking"}
    </Button>
  );
}

