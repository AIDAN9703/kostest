import { notFound } from "next/navigation";

import { AdminBookingProfileHeader } from "@/features/bookings/components/admin/view-booking/AdminBookingProfileHeader";
import { AdminBookingDetailsCard } from "@/features/bookings/components/admin/view-booking/AdminBookingDetailsCard";
import { AdminBookingPaymentCard } from "@/features/bookings/components/admin/view-booking/AdminBookingPaymentCard";
import { AdminBookingOpsSection } from "@/features/bookings/components/admin/view-booking/AdminBookingOpsSection";
import { BookingActivityTimeline } from "@/features/bookings/components/admin/view-booking/BookingActivityTimeline";

import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { bookingCrewService } from "@/features/bookings/services/booking-crew.service";
import { paymentService } from "@/features/payments/payment.service";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { crewProfileService } from "@/features/profiles/crew-profile.service";

import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = await params;
  const [booking, ops, rawEvents, bookingPayments, captains, bookingCrewRows, crewPool] =
    await Promise.all([
      bookingService.getBookingById(id),
      bookingOpsService.getByBookingId(id),
      bookingEventsService.listByBookingId(id),
      paymentService.getBookingPayments(id),
      captainProfileService.getCaptainsForAssignment(),
      bookingCrewService.listByBookingId(id),
      crewProfileService.getCrewForAssignment(),
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

  const captainOptions = [...captains];
  if (
    booking.captainUserId &&
    !captains.some((c) => c.id === booking.captainUserId)
  ) {
    captainOptions.unshift({
      id: booking.captainUserId,
      firstName: booking.captainFirstName,
      lastName: booking.captainLastName,
      email: booking.captainEmail ?? "",
    });
  }

  const crewOptions = [...crewPool];
  for (const row of bookingCrewRows) {
    if (!crewOptions.some((c) => c.id === row.userId)) {
      crewOptions.unshift({
        id: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
      });
    }
  }

  const bookingCrew = bookingCrewRows.map((row) => ({
    id: row.id,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: row.role,
  }));

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <AdminBookingProfileHeader booking={booking} />
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <AdminBookingDetailsCard booking={booking} />
        <AdminBookingPaymentCard
          bookingId={id}
          booking={booking}
          payments={bookingPayments}
          opsGmvCents={ops?.gmvCents ?? null}
        />
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-8">
        <AdminBookingOpsSection
          bookingId={id}
          totalAmountCents={booking.totalAmountCents ?? null}
          opsExpenseCents={ops?.expenseCents ?? null}
          opsGmvCents={ops?.gmvCents ?? null}
          opsPaidCents={ops?.paidCents ?? null}
          opsSentToOwnerCents={ops?.sentToOwnerCents ?? null}
          opsCrewName={ops?.crewName ?? null}
          opsContractSigned={ops?.contractSigned ?? null}
          opsConnected={ops?.connected ?? null}
          opsClientPaid={ops?.clientPaid ?? null}
          opsCaptainPaid={ops?.captainPaid ?? null}
          opsAllPaid={ops?.allPaid ?? null}
          opsSheetsSent={ops?.sheetsSent ?? null}
          opsCommissionAgentCents={ops?.commissionAgentCents ?? null}
          opsCommissionKosCents={ops?.commissionKosCents ?? null}
          opsSourceOverride={ops?.sourceOverride ?? null}
          captainUserId={booking.captainUserId}
          captainFirstName={booking.captainFirstName}
          captainLastName={booking.captainLastName}
          captainEmail={booking.captainEmail}
          captainOptions={captainOptions}
          bookingCrew={bookingCrew}
          crewOptions={crewOptions}
        />
        <BookingActivityTimeline events={activityEvents} className="lg:sticky lg:top-20" />
      </div>
    </div>
  );
}
