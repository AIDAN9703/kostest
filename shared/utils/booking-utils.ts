import { formatTime12Hour } from "./general-utils";
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * Generate time options for booking form (9 AM to 5 PM)
 * @returns Array of time options with 24h value and 12h label
 */
export function generateTimeOptions() {
  return Array.from({ length: 9 }, (_, i) => {
    const hour24 = i + 9; // 9 AM to 5 PM
    const time24 = `${hour24.toString().padStart(2, "0")}:00`;
    return {
      value: time24,
      label: formatTime12Hour(time24),
    };
  });
}

/**
 * NEW: Calculate end datetime based on start datetime and duration
 * @param startDateTime Start datetime object
 * @param hours Duration in hours
 * @returns End datetime object
 */
export function calculateEndDateTime(startDateTime: Date, hours: number): Date {
  if (!startDateTime || !hours) return startDateTime;
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + hours);
  
  return endDateTime;
}

/**
 * NEW: Create ISO string for database storage with proper timezone handling
 * @param date Date object (local date)
 * @param time Time string in HH:mm format (local time)
 * @param userTimezone Optional user timezone (defaults to browser timezone)
 * @returns ISO string in UTC for database storage
 */
export function createDateTimeISO(date: Date, time: string, userTimezone?: string): string {
  if (!date || !time) return "";
  
  const [hours, minutes] = time.split(":").map(Number);
  
  // Create a date object in the user's local timezone
  const localDateTime = new Date(date);
  localDateTime.setHours(hours, minutes, 0, 0);
  
  // Get the user's timezone (browser timezone if not specified)
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Convert local time to UTC for database storage
  const utcDateTime = fromZonedTime(localDateTime, timezone);
  
  return utcDateTime.toISOString();
}

/**
 * NEW: Parse ISO string to separate date and time for display in user's timezone
 * @param isoString ISO datetime string (UTC from database)
 * @param userTimezone Optional user timezone (defaults to browser timezone)
 * @returns Object with date and time components in user's local timezone
 */
export function parseISODateTime(isoString: string, userTimezone?: string) {
  if (!isoString) return { date: null, time: "" };
  
  // Get the user's timezone (browser timezone if not specified)
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Convert UTC datetime to user's local timezone
  const utcDate = new Date(isoString);
  const localDateTime = toZonedTime(utcDate, timezone);
  
  return {
    date: localDateTime,
    time: `${localDateTime.getHours().toString().padStart(2, "0")}:${localDateTime.getMinutes().toString().padStart(2, "0")}`
  };
}

/**
 * NEW: Format datetime for display in user's timezone
 * @param isoString ISO datetime string (UTC from database)
 * @param userTimezone Optional user timezone (defaults to browser timezone)
 * @returns Formatted datetime string in user's timezone
 */
export function formatDateTimeInTimezone(isoString: string, formatPattern: string = 'PPP p', userTimezone?: string): string {
  if (!isoString) return "";
  
  const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = new Date(isoString);
  const localDateTime = toZonedTime(utcDate, timezone);
  
  return formatTz(localDateTime, formatPattern, { timeZone: timezone });
}

/**
 * DEBUG: Test timezone conversion (can be removed in production)
 * @param testDate Date to test
 * @param testTime Time to test
 * @returns Object with conversion details
 */
export function debugTimezoneConversion(testDate: Date, testTime: string) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isoString = createDateTimeISO(testDate, testTime);
  const parsed = parseISODateTime(isoString);
  
  console.log('🕐 Timezone Conversion Debug:', {
    userTimezone: timezone,
    input: {
      date: testDate.toLocaleDateString(),
      time: testTime
    },
    utcISO: isoString,
    parsed: {
      date: parsed.date?.toLocaleDateString(),
      time: parsed.time
    },
    verification: {
      inputTime: testTime,
      parsedTime: parsed.time,
      matches: testTime === parsed.time
    }
  });
  
  return {
    timezone,
    isoString,
    parsed,
    matches: testTime === parsed.time
  };
}

// ============ LEGACY FUNCTIONS (for backward compatibility) ============

/**
 * Calculate end time based on start time and duration
 * @param startTime Start time in HH:mm format
 * @param hours Duration in hours
 * @returns End time in HH:mm format
 */
export function calculateEndTime(startTime: string, hours: number): string {
  if (!startTime || !hours) return "";
  
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const endHour = startHour + hours;
  
  // Handle overflow past midnight (shouldn't happen with our time restrictions)
  if (endHour >= 24) {
    return "23:59"; // Cap at end of day
  }
  
  return `${endHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
}

/**
 * Format end time for display with proper messaging for bookings
 * @param endTime End time in HH:mm format
 * @returns Formatted end time string with booking context
 */
export function formatEndTime(endTime: string): string {
  if (!endTime) return "Invalid end time";
  
  const [hours, minutes] = endTime.split(':').map(Number);
  
  // Check if end time is past reasonable hours
  if (hours >= 22) {
    return `${formatTime12Hour(endTime)} (Late evening)`;
  }
  
  return formatTime12Hour(endTime);
} 