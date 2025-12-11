import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBooking, updateBookingStatus, updatePaymentStatus, updateBooking } from "../booking.mutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

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

/**
 * Update booking fields mutation
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: {
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        numberOfPassengers?: number;
        startDateTime?: Date | string;
        endDateTime?: Date | string | null;
        totalAmount?: number;
        captainFee?: number | null;
        cleaningFee?: number | null;
        serviceFee?: number | null;
        taxAmount?: number | null;
        specialRequests?: string | null;
        pickupLocation?: string | null;
        dropoffLocation?: string | null;
        needsCaptain?: boolean;
      }
    }) => updateBooking(id, updates),
    onMutate: async (variables) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['bookings', 'detail', variables.id] });

      // Snapshot previous value for rollback on error
      const previousBooking = queryClient.getQueryData(['bookings', 'detail', variables.id]);

      // Optimistically update cache - merge updates into existing booking
      queryClient.setQueryData(['bookings', 'detail', variables.id], (old: any) => {
        if (!old) return old;
        return { ...old, ...variables.updates };
      });

      return { previousBooking };
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['bookings', 'detail', variables.id] });
        toast({
          title: "Booking updated",
          description: "Booking has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update booking.",
          variant: "destructive",
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(['bookings', 'detail', variables.id], context.previousBooking);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update booking.",
        variant: "destructive",
      });
    },
  });
}

