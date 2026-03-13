import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { unstable_cache } from 'next/cache'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UUID validation helper
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert 24-hour time format to 12-hour format for display
 * @param time24 Time in HH:mm format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24) return "";

  const [hours24, minutes] = time24.split(':').map(Number);
  const isPM = hours24 >= 12;
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
}

/**
 * Debounce function to limit how often a function can be called
 * Includes a cancel method for cleanup
 * 
 * @param func The function to debounce
 * @param waitFor The time to wait in milliseconds
 * @returns A debounced version of the function with a cancel method
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): F & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>): void => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };

  (debounced as any).cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as F & { cancel: () => void };
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
 * Converts first and last name to a full name string.
 * Returns null if both are empty/undefined.
 */
export function formatFirstLastNameToFull(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string | null {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || null;
}

/**
 * Formats a date in a human-readable format
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not available";

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date with time in a human-readable format
 * @param date The date to format
 * @returns A formatted date-time string (e.g. "Jan 15, 2025, 2:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "Not available";

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Date + time with seconds (e.g. audit timelines) */
export function formatDateTimeWithSeconds(
  date: Date | string | null | undefined
): string {
  if (!date) return "Not available";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}


export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate'
    ? (accurateSizes[i] ?? 'Bytest')
    : (sizes[i] ?? 'Bytes')
    }`;
}