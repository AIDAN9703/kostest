import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteBooking } from "../booking.mutations";
import { useToast } from "@/shared/lib/hooks/use-toast";

/**
 * Delete booking mutation
 */
export function useDeleteBooking() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: (result) => {
      if (result.success) {
        router.refresh();
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

