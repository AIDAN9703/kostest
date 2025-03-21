import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { unstable_cache } from 'next/cache'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
): Promise<T> {
  return unstable_cache(
    fetchFn,
    [key],
    {
      revalidate: options.revalidate ?? 3600,
      tags: options.tags ?? [key]
    }
  )();
}

/**
 * Throttle function that limits how often a function can be called
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T & { cancel: () => void } {
  let inThrottle: boolean = false;
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number = 0;

  function throttled(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!inThrottle) {
      const result = func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
      
      return result;
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
  
  throttled.cancel = function() {
    if (lastFunc) {
      clearTimeout(lastFunc);
      lastFunc = null;
    }
    inThrottle = false;
  };
  
  return throttled as T & { cancel: () => void };
}

/**
 * Formats a phone number to E.164 format for Twilio
 * E.164 format: +[country code][phone number without leading 0]
 * Example: +12345678900
 * 
 * @param phoneNumber The phone number to format
 * @param defaultCountryCode The default country code to use if not provided (default: '1' for US)
 * @returns The formatted phone number in E.164 format
 */
export function formatPhoneNumberE164(phoneNumber: string, defaultCountryCode: string = '1'): string {
  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');
  
  // Check if the number already has a country code (starts with '+')
  if (phoneNumber.startsWith('+')) {
    return '+' + digits;
  }
  
  // Check if the number already has a country code without the '+'
  // US numbers are typically 10 digits, if longer, assume it includes country code
  if (digits.length > 10 && digits.startsWith('1')) {
    return '+' + digits;
  }
  
  // For US numbers, they should be exactly 10 digits without country code
  if (digits.length === 10) {
    return '+' + defaultCountryCode + digits;
  }
  
  // If the number is less than 10 digits or doesn't match expected formats,
  // just add the + and default country code as a best effort
  return '+' + defaultCountryCode + digits;
}

/**
 * Find a user by email and verification token
 * @param email User's email
 * @param token Verification token
 * @returns User object if found, null if not found
 */
export async function findUserByEmailAndToken(email: string, token: string) {
  try {
    const { db } = await import('@/database/db');
    const { users } = await import('@/database/schema');
    const { eq, and, gt } = await import('drizzle-orm');

    // Find user with matching email and token that hasn't expired
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.verificationToken, token),
          gt(users.verificationTokenExpires, new Date())
        )
      )
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("Error finding user by email and token:", error);
    return null;
  }
}

/**
 * Clear a user's verification token
 * @param userId User ID
 * @returns True if successful, false if not
 */
export async function clearUserVerificationToken(userId: string) {
  try {
    const { db } = await import('@/database/db');
    const { users } = await import('@/database/schema');
    const { eq } = await import('drizzle-orm');

    await db
      .update(users)
      .set({
        verificationToken: null,
        verificationTokenExpires: null,
      })
      .where(eq(users.id, userId));
    
    return true;
  } catch (error) {
    console.error("Error clearing user verification token:", error);
    return false;
  }
}

/**
 * Debounce function to limit how often a function can be called
 * Useful for map interactions to prevent excessive calls
 * 
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
