import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser, deleteUser, bulkUpdateUsers } from "../user.mutations";
import { type User } from "@/database/types";
import { type CreateUserInput, type UpdateUserInput } from "@/features/users/user.validation";

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UpdateUserInput> }) => 
      updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, updates }: { userIds: string[]; updates: Partial<User> }) => 
      bulkUpdateUsers(userIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
