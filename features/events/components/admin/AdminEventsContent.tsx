"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StripeInstructions } from "@/features/events/components/StripeInstructions";
import { StatsCards } from "@/features/events/components/StatsCards";
import { AdminEventsTable } from "@/features/events/components/admin/AdminEventsTable";
import { EventModal } from "@/features/events/components/EventModal";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/features/events/hooks/useEventsApi";
import type { EventListItem } from "@/features/events/events.types";

interface AdminEventsContentProps {
  events: EventListItem[];
  stats: {
    totalEvents: number;
    activeEvents: number;
    ticketsSold: number;
    totalRevenue: number;
  };
}

export function AdminEventsContent({
  events,
  stats,
}: AdminEventsContentProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useQueryState("create");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(null);

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const clearModal = () => {
    setShowCreate(null);
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleCreate = async (eventData: any) => {
    try {
      await createMutation.mutateAsync(eventData);
      clearModal();
      router.refresh();
    } catch (e) {
      alert(`Error creating event: ${(e as Error).message}`);
    }
  };

  const handleUpdate = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedEvent.id,
        eventData,
      });
      clearModal();
      router.refresh();
    } catch (e) {
      alert(`Error updating event: ${(e as Error).message}`);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteMutation.mutateAsync(eventId);
      router.refresh();
    } catch (e) {
      alert(`Error deleting event: ${(e as Error).message}`);
    }
  };

  const handleEdit = (event: EventListItem) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const isModalOpen = showCreate === "true" || showEditModal;
  const isSaving =
    selectedEvent ? updateMutation.isPending : createMutation.isPending;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-card rounded-3xl border border-border shadow-xs">
      <div className="flex-shrink-0 border-b border-border">
        <div className="px-6 py-3 bg-card flex items-center justify-between">
          <h2 className="text-lg font-semibold">Events</h2>
          <Button
            size="sm"
            onClick={() => setShowCreate("true")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="flex-shrink-0 border-b border-border p-6 space-y-4">
        <StripeInstructions />
        <StatsCards stats={stats} />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AdminEventsTable
          events={events}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        loading={isSaving}
        onClose={clearModal}
        onSave={selectedEvent ? handleUpdate : handleCreate}
      />
    </div>
  );
}
