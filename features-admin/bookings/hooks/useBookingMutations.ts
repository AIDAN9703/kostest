import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "../booking.api";
import { useToast } from "@/shared/hooks/use-toast";

/**
 * Delete booking mutation
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.deleteBooking(bookingId),
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
      
      toast({
        title: "Booking deleted",
        description: "The booking has been successfully deleted.",
      });
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

