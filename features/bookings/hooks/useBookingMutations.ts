import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBooking, updateBookingStatus, updatePaymentStatus } from "../booking.mutations";
import { useToast } from "@/shared/hooks/use-toast";

/**
 * Delete booking mutation
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast({
          title: "Booking deleted",
          description: result.data?.message || "The booking has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete booking. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update booking status mutation
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast({
          title: "Status updated",
          description: "Booking status has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update booking status.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Update payment status mutation
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updatePaymentStatus(id, status),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        toast({
          title: "Payment status updated",
          description: "Payment status has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment status.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });
}

