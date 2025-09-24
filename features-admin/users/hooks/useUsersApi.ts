import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface User {
  id: string;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  image?: string | null;
  status?: string;
  role?: string;
  phoneNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export interface UsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Functions
const usersApi = {
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users?all=true'); // Fetch all users for client-side filtering
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch users');
    return data.users;
  },

  async getUserStats(): Promise<UserStats> {
    const response = await fetch('/api/users/stats');
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

  async createUser(userData: any): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  async updateUser(id: string, userData: any): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update user');
    return data.user;
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete user');
  },

  async updateUserField(id: string, field: string, value: string): Promise<User> {
    const response = await fetch(`/api/users/${id}/field`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update user field');
    return data.user;
  },
};

// Query Keys
export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...usersQueryKeys.lists(), filters] as const,
  details: () => [...usersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersQueryKeys.details(), id] as const,
  stats: () => [...usersQueryKeys.all, 'stats'] as const,
};

// Custom Hooks
export function useUsers() {
  return useQuery({
    queryKey: usersQueryKeys.lists(),
    queryFn: usersApi.getUsers,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: usersQueryKeys.stats(),
    queryFn: usersApi.getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      // Invalidate and refetch users and stats
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) =>
      usersApi.updateUser(id, userData),
    onSuccess: () => {
      // Invalidate and refetch users and stats
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      // Invalidate and refetch users and stats
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.stats() });
    },
  });
}

export function useUpdateUserField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, field, value }: { id: string; field: string; value: string }) =>
      usersApi.updateUserField(id, field, value),
    onSuccess: () => {
      // Invalidate and refetch users and stats
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.stats() });
    },
  });
}
