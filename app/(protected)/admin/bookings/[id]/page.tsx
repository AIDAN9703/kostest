import { bookingService } from "@/features/bookings/booking.service";
import { bookingOpsService } from "@/features/bookings/booking-ops.service";
import { bookingEventsService } from "@/features/bookings/booking-events.service";
import { BookingActivityTimeline } from "@/features/bookings/components/admin/BookingActivityTimeline";
import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";
import { notFound } from "next/navigation";
import { AdminBookingProfileHeader } from "@/features/bookings/components/admin/AdminBookingProfileHeader";
import { AdminBookingDetailsCard } from "@/features/bookings/components/admin/AdminBookingDetailsCard";
import { AdminBookingPaymentCard } from "@/features/bookings/components/admin/AdminBookingPaymentCard";
import { AdminBookingOpsCard } from "@/features/bookings/components/admin/AdminBookingOpsCard";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;
  const [booking, ops, rawEvents] = await Promise.all([
    bookingService.getBookingById(id),
    bookingOpsService.getByBookingId(id),
    bookingEventsService.listByBookingId(id),
  ]);

  const activityEvents: BookingActivityEventEntry[] = rawEvents.map((e) => ({
    id: e.id,
    actorType: e.actorType,
    eventType: e.eventType,
    channel: e.channel,
    displayMessage: e.displayMessage,
    content: e.content,
    contactMethod: e.contactMethod,
    metadata: (e.metadata as Record<string, unknown> | null) ?? null,
    previousState: (e.previousState as Record<string, unknown> | null) ?? null,
    newState: (e.newState as Record<string, unknown> | null) ?? null,
    createdAt: e.createdAt,
    actorName:
      e.actorFirstName || e.actorLastName
        ? `${e.actorFirstName || ""} ${e.actorLastName || ""}`.trim()
        : e.actorEmail || (e.actorType === "system" ? "System" : "—"),
  }));

  if (!booking) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:px-6">
      <AdminBookingProfileHeader booking={booking} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminBookingDetailsCard booking={booking} />
          <AdminBookingPaymentCard booking={booking} />
          <AdminBookingOpsCard bookingId={id} ops={ops} />
        </div>
        <div className="lg:col-span-1">
          <BookingActivityTimeline
            events={activityEvents}
            className="lg:sticky lg:top-20"
          />
        </div>
      </div>
    </div>
  );
}
