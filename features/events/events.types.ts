/**
 * Event types for admin events list and modal
 */

export interface EventTicketTier {
  id: string;
  eventId: string;
  name: string;
  price: string;
  maxQuantity: number;
  soldQuantity?: number;
  sortOrder: number;
  stripePriceId?: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  eventDate: Date | string;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  location?: string | null;
  yachtName?: string | null;
  totalCapacity: number;
  isActive: boolean;
  stripeProductId?: string | null;
  createdAt: Date | string;
  ticketTiers: EventTicketTier[];
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  ticketsSold: number;
  totalRevenue: number;
}
