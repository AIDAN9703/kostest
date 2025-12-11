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
 * User optimized for admin detail page
 * Includes owned boats, captain profile, and recent bookings
 */
export type UserForAdmin = User & {
  ownedBoats?: Array<{
    id: string;
    name: string;
    category: string;
    active: boolean;
    featured: boolean | null;
    mainImage: string | null;
    createdAt: Date;
  }>;
  captainProfile?: {
    id: string;
    status: string | null;
    availableForHire: boolean | null;
    uscgLicensed: boolean;
  } | null;
  bookings?: Array<{
    id: string;
    bookingStatus: string;
    bookingType: string;
    startDateTime: Date;
    totalAmount: number;
    createdAt: Date;
  }>;
};

/**
 * User optimized for profile page
 * Includes recent bookings, reviews, and unread notifications
 */
export type UserForProfile = User & {
  bookings?: Array<{
    id: string;
    bookingStatus: string;
    bookingType: string;
    startDateTime: Date;
    endDateTime: Date | null;
    totalAmount: number;
    createdAt: Date;
  }>;
  reviewsAsReviewer?: Array<{
    id: string;
    rating: number;
    createdAt: Date;
  }>;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    status: string;
    readAt: Date | null;
    createdAt: Date;
  }>;
};

/**
 * User optimized for boat owner pages
 * Includes owned boats with full details
 */
export type UserForBoatOwner = User & {
  ownedBoats?: Array<{
    id: string;
    name: string;
    category: string;
    active: boolean;
    featured: boolean | null;
    featuredOrder: number | null;
    mainImage: string | null;
    capacity: number;
    lengthFt: number;
    weeklyRate: number | null;
    monthlyRate: number | null;
    averageRating: number | null;
    totalReviews: number | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  captainProfile?: {
    id: string;
    status: string | null;
    availableForHire: boolean | null;
    uscgLicensed: boolean;
  } | null;
};

/**
 * User with all relations - includes related data like boats, bookings, etc.
 * Uses Drizzle relations API for type-safe nested queries
 * Use specific types above when possible for better performance
 */
export type UserWithRelations = User & {
  ownedBoats?: Array<{
    id: string;
    name: string;
    category: string;
    active: boolean;
    featured: boolean | null;
    mainImage: string | null;
    createdAt: Date;
  }>;
  captainProfile?: {
    id: string;
    status: string | null;
    availableForHire: boolean | null;
    uscgLicensed: boolean;
  } | null;
  bookings?: Array<{
    id: string;
    bookingStatus: string;
    bookingType: string;
    startDateTime: Date;
    totalAmount: number;
    createdAt: Date;
  }>;
  reviewsAsReviewer?: Array<{
    id: string;
    rating: number;
    createdAt: Date;
  }>;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    status: string;
    readAt: Date | null;
    createdAt: Date;
  }>;
};

/**
 * Response type for profile updates
 */
export interface ProfileUpdateResponse {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
