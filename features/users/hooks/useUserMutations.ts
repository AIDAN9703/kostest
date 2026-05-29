import { useMutation } from "@tanstack/react-query";
import { deleteUser } from "../user.mutations";

export function useDeleteUser() {
  return useMutation({
    mutationFn: deleteUser,
  });
}
