import { notFound } from "next/navigation";

import { AdminBookingProfileHeader } from "@/features/bookings/components/admin/view-booking/AdminBookingProfileHeader";
import { AdminBookingDetailsCard } from "@/features/bookings/components/admin/view-booking/AdminBookingDetailsCard";
import { AdminBookingPaymentCard } from "@/features/bookings/components/admin/view-booking/AdminBookingPaymentCard";
import { AdminBookingOpsSection } from "@/features/bookings/components/admin/view-booking/AdminBookingOpsSection";
import { BookingActivityTimeline } from "@/features/bookings/components/admin/view-booking/BookingActivityTimeline";

import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { paymentService } from "@/features/payments/payment.service";

import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = await params;
  const [booking, ops, rawEvents, bookingPayments] = await Promise.all([
    bookingService.getBookingById(id),
    bookingOpsService.getByBookingId(id),
    bookingEventsService.listByBookingId(id),
    paymentService.getBookingPayments(id),
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
    <div className="flex w-full flex-1 flex-col gap-6">
      <AdminBookingProfileHeader booking={booking} />
      <AdminBookingOpsSection
        bookingId={id}
        totalAmountCents={booking.totalAmountCents ?? null}
        opsExpenseCents={ops?.expenseCents ?? null}
        opsGmvCents={ops?.gmvCents ?? null}
        opsPaidCents={ops?.paidCents ?? null}
        opsSentToOwnerCents={ops?.sentToOwnerCents ?? null}
        opsCrewName={ops?.crewName ?? null}
        opsNote={ops?.opsNote ?? null}
        opsContractSigned={ops?.contractSigned ?? null}
        opsConnected={ops?.connected ?? null}
        opsClientPaid={ops?.clientPaid ?? null}
        opsCaptainPaid={ops?.captainPaid ?? null}
        opsAllPaid={ops?.allPaid ?? null}
        opsSheetsSent={ops?.sheetsSent ?? null}
        opsCommissionAgentCents={ops?.commissionAgentCents ?? null}
        opsCommissionKosCents={ops?.commissionKosCents ?? null}
        opsSourceOverride={ops?.sourceOverride ?? null}
      />
      <AdminBookingPaymentCard
        bookingId={id}
        booking={booking}
        payments={bookingPayments}
        opsGmvCents={ops?.gmvCents ?? null}
        opsPaidCents={ops?.paidCents ?? null}
        opsClientPaid={ops?.clientPaid ?? null}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AdminBookingDetailsCard booking={booking} />
        </div>
        <div className="lg:col-span-1">
          <BookingActivityTimeline events={activityEvents} className="lg:sticky lg:top-20" />
        </div>
      </div>
    </div>
  );
}
