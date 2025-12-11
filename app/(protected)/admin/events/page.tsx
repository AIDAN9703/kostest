"use client";

import { CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { StripeInstructions } from "@/features-admin/events/components/StripeInstructions";
import { StatsCards } from "@/features-admin/events/components/StatsCards";
import { EventsTable } from "@/features-admin/events/components/EventsTable";
import { EventModal } from "@/features-admin/events/components/EventModal";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { useEvents, useEventStats, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/features-admin/events/hooks/useEventsApi";

export default function EventsPage() {
  // URL state management with nuqs (handles ?create=true automatically)
  const [showCreate, setShowCreate] = useQueryState('create');
  
  // Local state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // TanStack Query hooks
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: stats = { totalEvents: 0, activeEvents: 0, ticketsSold: 0, totalRevenue: 0 }, isLoading: statsLoading } = useEventStats();
  
  // Mutations
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Centralized error handler (DRY principle)
  const handleError = (error: unknown, action: string) => {
    alert(`Error ${action}: ${(error as Error).message}`);
  };

  // Centralized modal state clearing (DRY principle)
  const clearModalState = () => {
    setShowCreate(null);
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      await createEventMutation.mutateAsync(eventData);
      clearModalState();
    } catch (error) {
      handleError(error, 'creating event');
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await updateEventMutation.mutateAsync({
        id: selectedEvent.id,
        eventData,
      });
      clearModalState();
    } catch (error) {
      handleError(error, 'updating event');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEventMutation.mutateAsync(eventId);
    } catch (error) {
      handleError(error, 'deleting event');
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Removed redundant isAnyLoading - use specific loading states instead

  return (
    <div className="p-6 space-y-6">


      <StripeInstructions />
      <StatsCards stats={stats} loading={statsLoading} />
      <EventsTable 
        events={events} 
        loading={eventsLoading}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <EventModal
        event={selectedEvent}
        isOpen={showCreate === 'true' || showEditModal}
        loading={selectedEvent ? updateEventMutation.isPending : createEventMutation.isPending}
        onClose={clearModalState}
        onSave={selectedEvent ? handleUpdateEvent : handleCreateEvent}
      />
    </div>
  );
}