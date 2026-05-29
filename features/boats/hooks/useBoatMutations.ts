import { useMutation } from "@tanstack/react-query";
import { deleteBoat } from "../boat.mutations";

export function useDeleteBoat() {
  return useMutation({
    mutationFn: deleteBoat,
  });
}
