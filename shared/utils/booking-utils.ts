import { formatTime12Hour } from "./general-utils";

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