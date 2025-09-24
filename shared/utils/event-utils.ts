import { formatTime12Hour } from "./general-utils";
import type { Event, TicketTier, EventWithTiers } from "@/database/schema/tables/events/events.relations";

/**
 * Format event date in long format for display
 * @param date ISO date string or Date object from database
 * @returns Formatted date string (e.g., "Friday, December 15, 2023")
 */
export function formatEventDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format event time from ISO datetime string or Date object
 * @param date ISO datetime string or Date object from database
 * @returns Formatted time string (e.g., "7:30 PM")
 */
export function formatEventTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get the lowest price from ticket tiers
 * @param tiers Array of ticket tiers
 * @returns Lowest price as number or null if no tiers
 */
export function getLowestTicketPrice(tiers: TicketTier[]): number | null {
  if (!tiers || tiers.length === 0) return null;
  return Math.min(...tiers.map(tier => parseFloat(tier.price)));
}

/**
 * Calculate total available tickets across all tiers
 * @param tiers Array of ticket tiers
 * @returns Total available tickets
 */
export function getAvailableTicketsCount(tiers: TicketTier[]): number {
  return tiers.reduce((sum, tier) => sum + (tier.maxQuantity - (tier.soldQuantity || 0)), 0);
}

/**
 * Check if an event has passed
 * @param eventDate Event date string or Date object
 * @returns True if event has passed
 */
export function isEventPassed(eventDate: string | Date): boolean {
  const eventDateTime = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  return eventDateTime < new Date();
}

/**
 * Get event status based on date and ticket availability
 * @param event Event with ticket tiers
 * @returns Event status object
 */
export function getEventStatus(event: EventWithTiers): {
  status: 'passed' | 'sold_out' | 'limited' | 'available';
  availableTickets: number;
  isBookable: boolean;
} {
  const availableTickets = getAvailableTicketsCount(event.ticketTiers);
  const passed = isEventPassed(event.eventDate);

  if (passed) {
    return { status: 'passed', availableTickets, isBookable: false };
  }
  
  if (availableTickets === 0) {
    return { status: 'sold_out', availableTickets, isBookable: false };
  }
  
  if (availableTickets <= 10) {
    return { status: 'limited', availableTickets, isBookable: true };
  }
  
  return { status: 'available', availableTickets, isBookable: true };
}

/**
 * Format price display with "and up" text
 * @param price Price number
 * @returns Formatted price string (e.g., "$50 and up")
 */
export function formatTicketPriceDisplay(price: number): string {
  return `$${price} and up`;
}

/**
 * Standardized error handler for event operations
 * @param error Error object or message
 * @param operation Description of the operation that failed
 * @param showAlert Whether to show user alert (default: true)
 */
export function handleEventError(error: unknown, operation: string, showAlert: boolean = true): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error(`Error ${operation}:`, error);
  
  if (showAlert) {
    alert(`Error ${operation}: ${errorMessage}`);
  }
}
