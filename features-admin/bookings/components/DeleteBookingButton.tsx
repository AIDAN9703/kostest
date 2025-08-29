"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { deleteBooking } from "@/features-admin/bookings/actions/bookings";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";

interface DeleteBookingButtonProps {
  bookingId: string;
  customerName: string;
  iconOnly?: boolean;
}

export function DeleteBookingButton({ bookingId, customerName, iconOnly = false }: DeleteBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBooking(bookingId);
      toast({
        title: "Booking deleted",
        description: `${customerName} booking has been deleted successfully.`,
      });
      setOpen(false);
      router.refresh();
      router.push("/admin/bookings");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Error",
        description: "Failed to delete the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (iconOnly) {
    return (
      <>
        <button
          type="button"
          className="text-red-600 hover:text-red-800 p-1 rounded-full focus:outline-hidden focus:ring-2 focus:ring-red-400"
          title="Delete"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          disabled={isDeleting}
        >
          <Trash className="h-5 w-5" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the booking for <span className="font-medium">{customerName}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // (Optional: add a non-icon version if needed in the future)
  return null;
} 