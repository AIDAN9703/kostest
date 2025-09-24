import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Event {
  id: number;
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
  id: number;
  eventId: number;
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

// API Functions
const eventsApi = {
  async getEvents(): Promise<Event[]> {
    const response = await fetch('/api/events');
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch events');
    return data.events;
  },

  async getStats(): Promise<EventStats> {
    const response = await fetch('/api/events/stats');
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

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

  async updateEvent(id: number, eventData: any): Promise<Event> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update event');
    return data.event;
  },

  async deleteEvent(id: number): Promise<void> {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete event');
  },
};

// Query Keys
export const eventsQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...eventsQueryKeys.lists(), filters] as const,
  details: () => [...eventsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventsQueryKeys.details(), id] as const,
  stats: () => [...eventsQueryKeys.all, 'stats'] as const,
};

// Custom Hooks
export function useEvents() {
  return useQuery({
    queryKey: eventsQueryKeys.lists(),
    queryFn: eventsApi.getEvents,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useEventStats() {
  return useQuery({
    queryKey: eventsQueryKeys.stats(),
    queryFn: eventsApi.getStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

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
    mutationFn: ({ id, eventData }: { id: number; eventData: any }) =>
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
