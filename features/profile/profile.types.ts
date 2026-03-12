/**
 * Profile feature types
 * Types used for profile display and update flows
 */

import type { User } from "@/database/types";

/**
 * User profile type - for profile pages and settings
 * Includes all fields needed for user profile display and editing
 */
export type UserProfile = Pick<
  User,
  | "id"
  | "email"
  | "username"
  | "firstName"
  | "lastName"
  | "profileImage"
  | "bio"
  | "isAdmin"
  | "status"
  | "emailVerified"
  | "phoneNumber"
  | "address"
  | "city"
  | "state"
  | "country"
  | "postalCode"
  | "identityVerified"
  | "createdAt"
>;

/**
 * Response type for profile update operations
 */
export interface ProfileUpdateResponse {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
