/**
 * Users API Client
 * Handles all data fetching via API routes
 */

import { type User } from '@/database/types';
import { type UserFilterInput } from '@/features/users/users.validation';
import { type PaginatedUsersResponse } from '@/features/users/user.types';
import { type ApiResponse, type PaginatedApiResponse } from '@/shared/types/api.types';

export const usersApi = {
  // ========================================
  // ADMIN API FUNCTIONS
  // ========================================

  /**
   * Fetch users with filtering and pagination (Admin)
   * Calls: GET /api/admin/users
   */
  async getUsers(filters: UserFilterInput = {}): Promise<PaginatedUsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (filters.search) searchParams.set('search', filters.search);
    if (filters.status) searchParams.set('status', filters.status);
    if (filters.role) searchParams.set('role', filters.role);
    if (filters.page) searchParams.set('page', filters.page.toString());
    if (filters.limit) searchParams.set('limit', filters.limit.toString());

    const response = await fetch(`/api/admin/users?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const json: PaginatedApiResponse<User> = await response.json();
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch users');
    }

    return {
      users: json.data,
      ...json.meta.pagination,
    };
  },

  /**
   * Fetch single user by ID (Admin)
   * Calls: GET /api/admin/users/[id]
   */
  async getUser(id: string): Promise<User> {
    const response = await fetch(`/api/admin/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const json: ApiResponse<User> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch user');
    }

    return json.data;
  },

  /**
   * Search users globally (Admin)
   * Calls: GET /api/admin/search
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    const json: any = await response.json();
    return json.results?.filter((result: any) => result.type === 'user') || [];
  },

  // ========================================
  // FRONTEND API FUNCTIONS
  // ========================================

  /**
   * Find user by email (Frontend - for booking flow)
   * Calls: GET /api/users/find
   */
  async findUserByEmail(email: string): Promise<{ exists: boolean; user?: User }> {
    const response = await fetch(`/api/users/find?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      // If 404, user doesn't exist
      if (response.status === 404) {
        return { exists: false };
      }
      throw new Error(`Failed to find user: ${response.statusText}`);
    }

    const json: ApiResponse<User> = await response.json();
    
    if (!json.success || !json.data) {
      return { exists: false };
    }

    return {
      exists: true,
      user: json.data,
    };
  },

  /**
   * Get current user profile (Frontend)
   * Calls: GET /api/users/profile
   */
  async getCurrentUserProfile(): Promise<User> {
    const response = await fetch('/api/users/profile');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const json: ApiResponse<User> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch profile');
    }

    return json.data;
  },

  /**
   * Get user by username (Frontend - for public profiles)
   * Calls: GET /api/users/[username]
   */
  async getUserByUsername(username: string): Promise<User> {
    const response = await fetch(`/api/users/${username}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const json: ApiResponse<User> = await response.json();
    
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to fetch user');
    }

    return json.data;
  },
};
