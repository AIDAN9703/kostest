/**
 * Profile Utilities
 * Helper functions and type guards for profile features
 */

import type { User } from '@/database/types';
import type { UserWithRelations } from '@/features/users/user.types';

/**
 * Type guard: Check if user has captain profile
 * 
 * @example
 * if (hasCaptainProfile(user)) {
 *   // TypeScript knows user.captainProfile exists
 *   console.log(user.captainProfile.status);
 * }
 */
export function hasCaptainProfile(
  user: User | UserWithRelations
): user is UserWithRelations & { captainProfile: NonNullable<UserWithRelations['captainProfile']> } {
  return 'captainProfile' in user && user.captainProfile !== null && user.captainProfile !== undefined;
}

/**
 * Type guard: Check if user has owner profile
 * 
 * @example
 * if (hasOwnerProfile(user)) {
 *   // TypeScript knows user.ownerProfile exists
 *   console.log(user.ownerProfile.businessType);
 * }
 */
export function hasOwnerProfile(
  user: User | UserWithRelations
): user is UserWithRelations & { ownerProfile: NonNullable<UserWithRelations['ownerProfile']> } {
  return 'ownerProfile' in user && user.ownerProfile !== null && user.ownerProfile !== undefined;
}

/**
 * Get user role badges for display
 * Returns array of role strings based on user's profile types
 * 
 * PRIORITY: Session flags first (fastest, always available), then fallback to relations
 * 
 * @example
 * const badges = getUserRoleBadges(user, session?.user);
 * // Returns: ['Captain', 'Owner', 'Admin'] based on session flags
 */
export function getUserRoleBadges(
  user: User | UserWithRelations,
  sessionUser?: { isCaptain?: boolean; isOwner?: boolean }
): string[] {
  const badges: string[] = [];

  // Check session flags first (fastest - session is always available in client components)
  if (sessionUser?.isCaptain) {
    badges.push('Captain');
  } else if (hasCaptainProfile(user)) {
    // Fallback: Only check relations if session flag not set (edge case)
    badges.push('Captain');
  }

  if (sessionUser?.isOwner) {
    badges.push('Owner');
  } else if (hasOwnerProfile(user)) {
    // Fallback: Only check relations if session flag not set (edge case)
    badges.push('Owner');
  }

  // Admin badge (from user.isAdmin - always in user object)
  if (user.isAdmin) {
    badges.push('Admin');
  }

  return badges;
}

/**
 * Check if user can access captain features
 * 
 * PRIORITY: Session flags first (session is always available), then fallback to relations
 * 
 * @example
 * if (canAccessCaptainFeatures(user, session)) {
 *   // Show captain dashboard
 * }
 */
export function canAccessCaptainFeatures(
  user: User | UserWithRelations,
  session?: { user?: { isCaptain?: boolean; captainStatus?: string | null } }
): boolean {
  // Check session flag first (session is always available in client components)
  if (session?.user?.isCaptain) {
    // Only allow if status is ACTIVE
    return session.user.captainStatus === 'ACTIVE';
  }

  // Fallback: Only check relations if session flag not set (rare edge case)
  // This handles cases where session might not be loaded yet or relations are needed
  if (hasCaptainProfile(user)) {
    return user.captainProfile.status === 'ACTIVE';
  }

  return false;
}

/**
 * Check if user can access owner features
 * 
 * PRIORITY: Session flags first (session is always available), then fallback to relations
 * 
 * @example
 * if (canAccessOwnerFeatures(user, session)) {
 *   // Show owner dashboard
 * }
 */
export function canAccessOwnerFeatures(
  user: User | UserWithRelations,
  session?: { user?: { isOwner?: boolean } }
): boolean {
  // Check session flag first (session is always available in client components)
  if (session?.user?.isOwner) {
    return true;
  }

  // Fallback: Only check relations if session flag not set (rare edge case)
  // This handles cases where session might not be loaded yet or relations are needed
  return hasOwnerProfile(user);
}
