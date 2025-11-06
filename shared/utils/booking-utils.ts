/**
 * Booking-specific utilities
 * Date/timezone functions moved to date-helpers.ts
 */

import { formatTime12Hour } from "./general-utils";

/**
 * Generate time options for booking form (9 AM to 5 PM)
 */
export function generateTimeOptions() {
  return Array.from({ length: 9 }, (_, i) => {
    const hour24 = i + 9;
    const time24 = `${hour24.toString().padStart(2, "0")}:00`;
    return {
      value: time24,
      label: formatTime12Hour(time24),
    };
  });
}

 