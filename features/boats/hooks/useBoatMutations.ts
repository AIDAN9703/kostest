import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoat, updateBoat, deleteBoat, toggleBoatActive } from "../boat.mutations";
import { type CreateBoatInput, type UpdateBoatInput } from "@/features/boats/boat.validation";

export function useCreateBoat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBoat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

export function useUpdateBoat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UpdateBoatInput> }) => 
      updateBoat(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

export function useDeleteBoat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBoat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

export function useToggleBoatActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleBoatActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

