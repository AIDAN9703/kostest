import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../user.api";
import { type UserFilterInput } from "@/features/users/user.validation";

/**
 * Fetch paginated and filtered users list

 */
export function useUsers(filters: UserFilterInput = {}) {
  return useQuery({
    queryKey: ['users', 'list', filters],
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
