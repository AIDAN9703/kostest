/**
 * User-related application types
 * Derived from database User type
 */

import { User, UserStatus, UserRole } from '@/database/types';

// ========================================
// DERIVED USER TYPES
// ========================================

/**
 * Public user type - safe to send to frontend (no sensitive fields)
 */
export type PublicUser = Omit<User, 
  | 'password' 
  | 'twoFactorSecret' 
  | 'resetPasswordToken' 
  | 'resetPasswordExpires' 
  | 'accountLockedUntil'
>;

/**
 * User profile type - for profile pages
 */
export type UserProfile = Pick<User, 
  | 'id' 
  | 'email' 
  | 'username' 
  | 'firstName' 
  | 'lastName' 
  | 'displayName'
  | 'profileImage'
  | 'coverImage'
  | 'bio'
  | 'role'
  | 'status'
  | 'emailVerified'
  | 'phoneNumber'
  | 'city'
  | 'state'
  | 'country'
  | 'createdAt'
>;

/**
 * User list item - minimal data for lists/tables
 */
export type UserListItem = Pick<User,
  | 'id'
  | 'email'
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'profileImage'
  | 'status'
  | 'role'
  | 'phoneNumber'
  | 'emailVerified'
  | 'createdAt'
  | 'updatedAt'
>;

// ========================================
// API RESPONSE TYPES
// ========================================

/**
 * Paginated users response
 * Used by admin API endpoints
 */
export interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// APP-SPECIFIC USER TYPES
// ========================================

/**
 * Response type for profile updates
 */
export interface ProfileUpdateResponse {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
