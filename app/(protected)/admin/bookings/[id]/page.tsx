import { notFound } from "next/navigation";

import { AdminBookingHeader } from "@/features/bookings/components/admin/view-booking/AdminBookingHeader";
import { DealPipelineBar } from "@/features/bookings/components/admin/DealPipelineBar";
import { computeDealStatusForBooking } from "@/features/bookings/deal-status";
import { LeadDetailView } from "@/features/inquiries/components/LeadDetailView";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { OUTCOME_LABELS, STAGE_LABELS } from "@/features/inquiries/inquiry-ui";
import type { InquiryEvent } from "@/database/types";
import {
  BookingTripCard,
  type BookingTripDetailsSnapshot,
} from "@/features/bookings/components/admin/view-booking/BookingTripCard";
import { BookingClientCard } from "@/features/bookings/components/admin/view-booking/BookingClientCard";
import {
  BookingEditModeProvider,
  BookingPageEditButton,
} from "@/features/bookings/components/admin/view-booking/BookingEditMode";
import { BookingPaymentsFinancialsCard } from "@/features/bookings/components/admin/view-booking/BookingPaymentsFinancialsCard";
import { AdminBookingChecklistCard } from "@/features/bookings/components/admin/view-booking/AdminBookingChecklistCard";
import { BookingQuickActionsMenu } from "@/features/bookings/components/admin/view-booking/BookingQuickActionsMenu";
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
    // One master view: ids of unconverted leads resolve here too, rendering
    // the lead-phase face of the same deal page.
    const lead = await inquiryService.getInquiryById(id);
    if (lead) {
      return <LeadDetailView inquiryId={id} />;
    }
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
    originatingLead,
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
    booking.inquiryId
      ? inquiryService.getInquiryById(booking.inquiryId)
      : Promise.resolve(null),
  ]);

  const bookingActivityEntries: BookingActivityEventEntry[] = rawEvents.map((e) => ({
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

  // ONE activity feed per deal: the originating lead's history rides along
  // with the booking's own events, newest first.
  const activityEvents: BookingActivityEventEntry[] = [
    ...bookingActivityEntries,
    ...buildLeadActivityEntries(
      (originatingLead?.events ?? []) as LeadEventWithActor[]
    ),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
    <BookingEditModeProvider>
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* Identity header: who + quick actions + lifecycle */}
      <header className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <AdminBookingHeader booking={booking} />
          <div className="flex shrink-0 items-center gap-2">
            <BookingPageEditButton />
            <BookingQuickActionsMenu
              bookingId={id}
              bookingStatus={booking.bookingStatus}
              allowPaymentLink={allowPaymentLink}
              publicToken={booking.publicToken}
            />
          </div>
        </div>
        <div className="border-t border-border/50 px-5 py-3">
          <DealPipelineBar
            dealStatus={computeDealStatusForBooking({
              bookingStatus: booking.bookingStatus,
              paymentDisplayStatus: booking.paymentDisplayStatus,
              hasRefund: booking.hasRefund,
            })}
          />
        </div>
      </header>

      {/* Body: content left, activity feed running the full right side */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 [&>*]:min-w-0">
            <BookingClientCard bookingId={id} client={clientSnapshot} />
            <AdminBookingChecklistCard bookingId={id} items={checklistItems} />
          </div>

          <BookingTripCard
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

          <BookingPaymentsFinancialsCard
            bookingId={id}
            booking={booking}
            payments={bookingPayments}
            opsGmvCents={ops?.gmvCents ?? null}
            opsExpenseCents={ops?.expenseCents ?? null}
            commissionAgentCents={ops?.commissionAgentCents ?? null}
            commissionKosCents={ops?.commissionKosCents ?? null}
            expenseLines={expenseLines}
          />
        </div>

        <BookingActivityTimeline
          events={activityEvents}
          className="lg:sticky lg:top-20"
        />
      </div>
    </div>
    </BookingEditModeProvider>
  );
}

type LeadEventWithActor = InquiryEvent & {
  createdByUser?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

/**
 * Fold the originating lead's history into the booking's activity feed —
 * one timeline per deal, from first inquiry to final payment.
 */
function buildLeadActivityEntries(events: LeadEventWithActor[]) {
  return events.map((e) => {
    let displayMessage: string;
    switch (e.eventType) {
      case "CREATED":
        displayMessage = "Inquiry received";
        break;
      case "STAGE_CHANGE":
        displayMessage =
          e.previousStage && e.newStage
            ? `Lead stage: ${STAGE_LABELS[e.previousStage] ?? e.previousStage} → ${STAGE_LABELS[e.newStage] ?? e.newStage}`
            : "Lead stage changed";
        break;
      case "OUTCOME_CHANGE":
        displayMessage =
          e.previousOutcome && e.newOutcome
            ? `Lead outcome: ${OUTCOME_LABELS[e.previousOutcome] ?? e.previousOutcome} → ${OUTCOME_LABELS[e.newOutcome] ?? e.newOutcome}`
            : "Lead outcome changed";
        break;
      case "CONTACT_ATTEMPT":
        displayMessage = "Contact logged";
        break;
      case "NOTE":
        displayMessage = "Note";
        break;
      case "ASSIGNED":
        displayMessage = e.content ?? "Assigned";
        break;
      default:
        displayMessage = String(e.eventType).replace(/_/g, " ").toLowerCase();
    }
    const actorName =
      e.createdByUser?.firstName || e.createdByUser?.lastName
        ? `${e.createdByUser.firstName ?? ""} ${e.createdByUser.lastName ?? ""}`.trim()
        : (e.createdByUser?.email ?? "System");
    return {
      id: `lead-${e.id}`,
      actorType: e.createdBy ? "admin" : "system",
      eventType: `lead.${e.eventType.toLowerCase()}`,
      channel: null,
      displayMessage,
      content: e.eventType === "ASSIGNED" ? null : e.content,
      contactMethod: e.contactMethod,
      metadata: (e.metadata as Record<string, unknown> | null) ?? null,
      previousState: null,
      newState: null,
      createdAt: new Date(e.createdAt),
      actorName,
    };
  });
}
