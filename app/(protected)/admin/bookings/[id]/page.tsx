import { notFound } from "next/navigation";

import { AdminBookingHeader } from "@/features/bookings/components/admin/view-booking/AdminBookingHeader";
import {
  AdminBookingDetailsCard,
  type BookingTripDetailsSnapshot,
} from "@/features/bookings/components/admin/view-booking/AdminBookingDetailsCard";
import { AdminBookingClientCard } from "@/features/bookings/components/admin/view-booking/AdminBookingClientCard";
import { AdminBookingPaymentCard } from "@/features/bookings/components/admin/view-booking/AdminBookingPaymentCard";
import { AdminBookingOpsSection } from "@/features/bookings/components/admin/view-booking/AdminBookingOpsSection";
import { AdminBookingChecklistCard } from "@/features/bookings/components/admin/view-booking/AdminBookingChecklistCard";
import { AdminBookingQuickActionsCard } from "@/features/bookings/components/admin/view-booking/AdminBookingQuickActionsCard";
import { BookingActivityTimeline } from "@/features/bookings/components/admin/view-booking/BookingActivityTimeline";

import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingExpenseLineService } from "@/features/bookings/services/booking-expense-line.service";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { bookingCrewService } from "@/features/bookings/services/booking-crew.service";
import { paymentService } from "@/features/payments/payment.service";
import { captainProfileService } from "@/features/profiles/captain-profile.service";
import { crewProfileService } from "@/features/profiles/crew-profile.service";
import { computeBookingChecklist } from "@/features/bookings/booking-checklist";

import type { BookingActivityEventEntry } from "@/features/bookings/booking.types";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const { id } = await params;
  const booking = await bookingService.getBookingById(id);
  if (!booking) {
    notFound();
  }

  const [
    ops,
    expenseLines,
    rawEvents,
    bookingPayments,
    captains,
    bookingCrewRows,
    crewPool,
    lifetimeBookingCount,
  ] = await Promise.all([
    bookingOpsService.getByBookingId(id),
    bookingExpenseLineService.getLines(id),
    bookingEventsService.listByBookingId(id),
    paymentService.getBookingPayments(id),
    captainProfileService.getCaptainsForAssignment(),
    bookingCrewService.listByBookingId(id),
    crewProfileService.getCrewForAssignment(),
    booking.userId
      ? bookingService.countBookingsForUser(booking.userId)
      : Promise.resolve(0),
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

  const captainOptions = [...captains];
  if (booking.captainUserId && !captains.some((c) => c.id === booking.captainUserId)) {
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

  const tripSnapshot: BookingTripDetailsSnapshot = {
    numberOfPassengers: booking.numberOfPassengers,
    needsCaptain: booking.needsCaptain,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    startDateTime: booking.startDateTime.toISOString(),
    endDateTime: booking.endDateTime ? booking.endDateTime.toISOString() : null,
    boatTimezone: booking.boatTimezone,
    boatId: booking.boatId,
    boatName: booking.boatName,
    selectedBoat:
      booking.boatId != null
        ? {
            id: booking.boatId,
            name: booking.boatName ?? "",
            mainImage: booking.boatMainImage,
            capacity: booking.boatCapacity ?? 0,
            locationLabel: null,
            cleaningFee: null,
            depositAmount: null,
            crewRequired: null,
          }
        : null,
  };

  const checklistItems = computeBookingChecklist({
    bookingStatus: booking.bookingStatus,
    totalAmountCents: booking.totalAmountCents,
    totalPaidCents: booking.totalPaidCents,
    captainUserId: booking.captainUserId,
    opsContractSigned: ops?.contractSigned ?? null,
    opsCaptainPaid: ops?.captainPaid ?? null,
    opsGmvCents: ops?.gmvCents ?? null,
    opsExpenseCents: ops?.expenseCents ?? null,
    opsSentToOwnerCents: ops?.sentToOwnerCents ?? null,
  });

  // Hide the "send payment link" quick action once the booking is fully paid
  // or has been refunded — nothing meaningful left to collect.
  const allowPaymentLink =
    (booking.totalAmountCents ?? 0) > 0 &&
    (booking.totalPaidCents ?? 0) < (booking.totalAmountCents ?? 0) &&
    booking.bookingStatus !== "CANCELLED";

  const clientSnapshot = {
    customerUserId: booking.userId,
    customerName: booking.customerName ?? "",
    customerEmail: booking.customerEmail ?? "",
    customerPhone: booking.customerPhone ?? "",
    profileImage: booking.userProfileImage,
    lifetimeBookingCount,
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <AdminBookingHeader booking={booking} />

      {/* Client, status, quick actions — one compact row */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 [&>*]:min-w-0">
        <AdminBookingClientCard bookingId={id} client={clientSnapshot} />
        <AdminBookingChecklistCard bookingId={id} items={checklistItems} />
        <AdminBookingQuickActionsCard bookingId={id} allowPaymentLink={allowPaymentLink} />
      </div>

      {/* Trip details, then payment one row down */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <AdminBookingDetailsCard
          bookingId={id}
          trip={tripSnapshot}
          captainUserId={booking.captainUserId}
          captainFirstName={booking.captainFirstName}
          captainLastName={booking.captainLastName}
          captainEmail={booking.captainEmail}
          captainOptions={captainOptions}
          bookingCrew={bookingCrew}
          crewOptions={crewOptions}
        />
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
          currency={booking.currency ?? "USD"}
          totalAmountCents={booking.totalAmountCents ?? null}
          opsExpenseCents={ops?.expenseCents ?? null}
          opsGmvCents={ops?.gmvCents ?? null}
          opsPaidCents={ops?.paidCents ?? null}
          opsSentToOwnerCents={ops?.sentToOwnerCents ?? null}
          opsCrewName={ops?.crewName ?? null}
          opsConnected={ops?.connected ?? null}
          opsClientPaid={ops?.clientPaid ?? null}
          opsCaptainPaid={ops?.captainPaid ?? null}
          opsAllPaid={ops?.allPaid ?? null}
          opsSheetsSent={ops?.sheetsSent ?? null}
          opsCommissionAgentCents={ops?.commissionAgentCents ?? null}
          opsCommissionKosCents={ops?.commissionKosCents ?? null}
          opsSourceOverride={ops?.sourceOverride ?? null}
          expenseLines={expenseLines}
          pricingTierId={booking.pricingTierId ?? null}
        />
        <BookingActivityTimeline
          events={activityEvents}
          className="lg:sticky lg:top-20"
        />
      </div>
    </div>
  );
}
