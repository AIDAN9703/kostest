import { useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  yachtName?: string;
  totalCapacity: number;
  isActive: boolean;
  stripeProductId?: string;
  ticketTiers: TicketTier[];
  createdAt: string;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  price: string;
  maxQuantity: number;
  soldQuantity: number;
  sortOrder: number;
  stripePriceId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  ticketsSold: number;
  totalRevenue: number;
}

// API Functions (mutations only - list/stats fetched server-side)
const eventsApi = {
  async createEvent(eventData: any): Promise<Event> {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to create event');
    return data.event;
  },

  async updateEvent(id: string, eventData: any): Promise<Event> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update event');
    return data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete event');
  },
};

// Query Keys (for cache invalidation)
export const eventsQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventsQueryKeys.all, 'list'] as const,
  stats: () => [...eventsQueryKeys.all, 'stats'] as const,
};

// Mutation Hooks
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      // Invalidate and refetch events and stats
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.stats() });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, eventData }: { id: string; eventData: any }) =>
      eventsApi.updateEvent(id, eventData),
    onSuccess: () => {
      // Invalidate and refetch events and stats
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.stats() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      // Invalidate and refetch events and stats
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.stats() });
    },
  });
}
