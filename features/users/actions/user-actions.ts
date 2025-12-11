'use server';

import { userService } from "@/features/users/user.service";
import { cache } from "react";

export async function getBoatOwners(query: string) {
  if (!query || query.length < 2) {
    return [];
  }
  
  return await userService.getBoatOwners(query);
}

/**
 * Get user by ID (basic, no relations)
 * Cached for performance
 */
export const getUserById = cache(async (userId: string) => {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserById(userId);
});

/**
 * Get user optimized for admin detail page
 * Includes owned boats, captain profile, and recent bookings
 * Cached for performance
 */
export const getUserForAdmin = cache(async (userId: string) => {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserForAdmin(userId);
});

/**
 * Get user optimized for profile page
 * Includes recent bookings, reviews, and unread notifications
 * Cached for performance
 */
export const getUserForProfile = cache(async (userId: string) => {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserForProfile(userId);
});

/**
 * Get user optimized for boat owner pages
 * Includes owned boats with full details
 * Cached for performance
 */
export const getUserForBoatOwner = cache(async (userId: string) => {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserForBoatOwner(userId);
});

/**
 * Get user by ID with all relations (boats, bookings, notifications, etc.)
 * Uses new Drizzle relations API for cleaner, type-safe queries
 * Use specific methods above when possible for better performance
 * Cached for performance
 */
export const getUserByIdWithRelations = cache(async (userId: string) => {
  if (!userId) {
    return null;
  }
  
  return await userService.getUserByIdWithRelations(userId);
});

export async function getAdmins() {
  return await userService.getAdmins();
}