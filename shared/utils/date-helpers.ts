/**
 * Date Utilities - Clean & Concise
 * 
 * With SuperJSON: Dates are Date objects everywhere
 * Only convert: Form inputs (ISO strings) → Date objects for DB
 */

import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { timezoneEnum } from '@/database/schema/enums';

export type SupportedTimezones = typeof timezoneEnum.enumValues[number];
const DEFAULT_TIMEZONE: SupportedTimezones = 'America/New_York';

/**
 * Convert form input (ISO string) to Date for database
 * Handles empty strings and invalid dates
 */
export function toDateOrNull(value: string | Date | null | undefined): Date | null {
  if (!value || value === "") return null;
  if (value instanceof Date) return value;
  
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get boat timezone or default
 */
export function getBoatTimezone(boat: { 
  timezone?: SupportedTimezones | string | null;
}): SupportedTimezones {
  return (boat.timezone as SupportedTimezones) || DEFAULT_TIMEZONE;
}

/**
 * Create ISO string from date + time in boat's timezone
 * Used when user selects date/time in booking form
 */
export function createDateTimeISO(
  date: Date, 
  time: string, 
  boat?: { timezone?: SupportedTimezones | string | null; }
): string {
  if (!date || !time) return "";
  
  const timezone = boat ? getBoatTimezone(boat) : DEFAULT_TIMEZONE;
  const dateStr = date.toISOString().split('T')[0];
  const boatDateTimeStr = `${dateStr} ${time}:00`;
  const utcDateTime = fromZonedTime(boatDateTimeStr, timezone);
  
  return utcDateTime.toISOString();
}

/**
 * Parse Date object or ISO string and return date/time in boat's timezone
 * Used for displaying booking times
 */
export function parseDateTimeInBoatTimezone(
  dateTime: Date | string | null,
  boat?: { timezone?: SupportedTimezones | string | null; }
) {
  if (!dateTime) return { date: null, time: "" };
  
  const timezone = boat ? getBoatTimezone(boat) : DEFAULT_TIMEZONE;
  const dateObj = dateTime instanceof Date ? dateTime : new Date(dateTime);
  
  if (isNaN(dateObj.getTime())) return { date: null, time: "" };
  
  const boatDateTime = toZonedTime(dateObj, timezone);
  
  return {
    date: boatDateTime,
    time: `${boatDateTime.getHours().toString().padStart(2, "0")}:${boatDateTime.getMinutes().toString().padStart(2, "0")}`
  };
}

/**
 * Calculate end datetime from start + hours
 */
export function calculateEndDateTime(startDateTime: Date, hours: number): Date {
  if (!startDateTime || !hours) return startDateTime;
  const end = new Date(startDateTime);
  end.setHours(end.getHours() + hours);
  return end;
}
