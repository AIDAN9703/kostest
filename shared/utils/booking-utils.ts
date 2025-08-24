import { formatTime12Hour } from "./general-utils";
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { timezoneEnum } from "@/database/schema/enums";

// Supported timezones type - inferred from database enum
export type SupportedTimezones = typeof timezoneEnum.enumValues[number];

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

// Default timezone fallback
const DEFAULT_TIMEZONE: SupportedTimezones = 'America/New_York' as const;

/**
 * Get timezone for a boat from database
 * @param boat Boat object with timezone data  
 * @returns Timezone string
 */
export function getBoatTimezone(boat: { 
  timezone?: SupportedTimezones | string | null;
}): SupportedTimezones {
  // Use explicit timezone from database or default
  // Handle both enum and string types (from URL serialization)
  return (boat.timezone as SupportedTimezones) || DEFAULT_TIMEZONE;
}

/**
 * SCALABLE: Create ISO string treating user input as BOAT's local time
 * Each boat can be in a different timezone
 * @param date Date object (calendar date)
 * @param time Time string in HH:mm format (boat's local time)
 * @param boatTimezone Boat's timezone (e.g., "America/Chicago")
 * @returns ISO string in UTC for database storage
 */
export function createDateTimeISO(date: Date, time: string, boat?: { 
  timezone?: SupportedTimezones | string | null;
}): string {
  if (!date || !time) return "";
  
  // Get timezone from boat data or use default
  const timezone = boat ? getBoatTimezone(boat) : DEFAULT_TIMEZONE;
  
  // Create date string in YYYY-MM-DD format
  const dateStr = date.toISOString().split('T')[0];
  
  // Combine date + time as boat's local timezone
  const boatDateTimeStr = `${dateStr} ${time}:00`;
  
  // Convert boat's local time to UTC for database storage
  const utcDateTime = fromZonedTime(boatDateTimeStr, timezone);
  
  return utcDateTime.toISOString();
}



/**
 * Parse ISO string and display in BOAT's timezone
 * Industry standard: Always show times in boat's local timezone
 * @param isoString ISO datetime string (UTC from database)
 * @param boat Boat object with timezone data
 * @returns Object with date and time components in boat's timezone
 */
export function parseISODateTimeInBoatTimezone(isoString: string, boat?: { 
  timezone?: SupportedTimezones | string | null;
}) {
  if (!isoString) return { date: null, time: "" };
  
  // Get timezone from boat data or use default
  const timezone = boat ? getBoatTimezone(boat) : DEFAULT_TIMEZONE;
  
  // Convert UTC to boat's timezone
  const boatDateTime = toZonedTime(isoString, timezone);
  
  return {
    date: boatDateTime,
    time: `${boatDateTime.getHours().toString().padStart(2, "0")}:${boatDateTime.getMinutes().toString().padStart(2, "0")}`
  };
}

 