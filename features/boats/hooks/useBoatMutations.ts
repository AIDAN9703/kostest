import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBoat } from "../boat.mutations";

export function useDeleteBoat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBoat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

