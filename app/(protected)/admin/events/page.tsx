import { getAllEvents, getEventStats } from "@/features/events/events.service";
import { AdminEventsContent } from "@/features/events/components/admin/AdminEventsContent";

export default async function EventsPage() {
  const [events, stats] = await Promise.all([
    getAllEvents(),
    getEventStats(),
  ]);

  return (
    <div className="p-4 md:px-6">
      <AdminEventsContent events={events} stats={stats} />
    </div>
  );
}
