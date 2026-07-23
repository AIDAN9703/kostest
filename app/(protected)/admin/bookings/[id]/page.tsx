import { notFound } from "next/navigation";

import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Ship } from "lucide-react";
import { auth } from "@/auth";
import { DealHeaderCard } from "@/features/bookings/components/admin/view-booking/DealHeaderCard";
import { DealRequestCard } from "@/features/bookings/components/admin/view-booking/DealRequestCard";
import {
  computeDealStatusForBooking,
  DEAL_KIND_LABELS,
  DEAL_SOURCE_LABELS,
} from "@/features/bookings/deal-status";
import { adminInitials } from "@/shared/lib/utils/people-display";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";
import { DealPipelineBar } from "@/features/bookings/components/admin/DealPipelineBar";
import {
  BookingTripCard,
  type BookingTripDetailsSnapshot,
} from "@/features/bookings/components/admin/view-booking/BookingTripCard";
import {
  BookingEditModeProvider,
  BookingPageEditButton,
} from "@/features/bookings/components/admin/view-booking/BookingEditMode";
import { BookingPaymentsFinancialsCard } from "@/features/bookings/components/admin/view-booking/BookingPaymentsFinancialsCard";
import { BookingChecksPanel } from "@/features/bookings/components/admin/view-booking/BookingChecksPanel";
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
import { userService } from "@/features/users/user.service";
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
    admins,
    session,
  ] = await Promise.all([
    bookingOpsService.getByBookingId(id),
    bookingExpenseLineService.getLines(id),
    bookingEventsService.listByBookingId(id),
    paymentService.getBookingPayments(id),
    captainProfileService.getCaptainsForAssignment(),
    bookingCrewService.listByBookingId(id),
    crewProfileService.getCrewForAssignment(),
    userService.getAdmins(),
    auth(),
  ]);

  // ONE activity feed per deal — migrated lead history lives natively in
  // booking_event (lead.* event types), so no merging is needed.
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
    startDateTime: booking.startDateTime ? booking.startDateTime.toISOString() : null,
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
    assignedAdminId: booking.assignedAdminId,
    firstContactedAt: booking.firstContactedAt,
    boatId: booking.boatId,
  });

  // Hide the "send payment link" quick action once the booking is fully paid
  // or has been refunded — nothing meaningful left to collect.
  const allowPaymentLink =
    (booking.totalAmountCents ?? 0) > 0 &&
    (booking.totalPaidCents ?? 0) < (booking.totalAmountCents ?? 0) &&
    booking.bookingStatus !== "CANCELLED";

  const isInquiry = booking.bookingStatus === "INQUIRY";
  const dealStatus = computeDealStatusForBooking({
    bookingStatus: booking.bookingStatus,
    paymentDisplayStatus: booking.paymentDisplayStatus,
    hasRefund: booking.hasRefund,
    archivedAt: booking.archivedAt,
  });
  const adminOptions = admins.map((a) => ({
    id: a.id,
    name:
      [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || a.email || "Unknown admin",
  }));

  return (
    <BookingEditModeProvider>
    <div className="flex w-full flex-1 flex-col">
      {/* Content left (header + cards share one width), activity rail running
          the FULL right side of the page. */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {/* Identity header — one face for every deal status */}
          <DealHeaderCard
        eyebrow={`${isInquiry ? "Inquiry" : "Booking"} #${booking.id.slice(0, 6).toUpperCase()}`}
        name={booking.customerName || "Unnamed customer"}
        avatarInitials={adminInitials(booking.customerName ?? "") || "?"}
        avatarClassName={isInquiry ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary-strong"}
        typeChip={
          <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {DEAL_KIND_LABELS[booking.bookingType] ?? booking.bookingType}
          </span>
        }
        meta={
          isInquiry ? (
            <>
              {DEAL_SOURCE_LABELS[booking.source ?? ""] ?? booking.source}
              {" · received "}
              <span className="tabular-nums">
                {formatDistanceToNowStrict(new Date(booking.createdAt))} ago
              </span>
            </>
          ) : (
            <BookingHeaderMeta booking={booking} />
          )
        }
        value={
          booking.totalAmountCents > 0
            ? {
                label: "Total",
                text: formatCentsAsCurrency(booking.totalAmountCents, {
                  currency: booking.currency ?? "USD",
                }),
              }
            : booking.estimatedValueCents != null
              ? {
                  label: "Est. value",
                  text: formatCentsAsCurrency(booking.estimatedValueCents),
                }
              : null
        }
        actions={
          <div className="flex shrink-0 items-center gap-2">
            {!isInquiry ? <BookingPageEditButton /> : null}
            <BookingQuickActionsMenu
              bookingId={id}
              bookingStatus={booking.bookingStatus}
              allowPaymentLink={allowPaymentLink}
              publicToken={booking.publicToken}
              isCold={booking.coldAt != null}
              isArchived={booking.archivedAt != null}
              assignedAdminId={booking.assignedAdminId}
              admins={adminOptions}
              currentUserId={session?.user?.id ?? null}
            />
          </div>
        }
        email={booking.customerEmail}
        phone={booking.customerPhone}
            pipeline={
              <DealPipelineBar
                dealStatus={dealStatus}
                contacted={booking.firstContactedAt != null}
                cold={booking.coldAt != null}
              />
            }
          />

          {isInquiry ? (
            /* Lead phase: same skeleton as a booking — checks first, then
               what the customer asked for. Contact info lives in the header. */
            <>
              <BookingChecksPanel bookingId={id} items={checklistItems} />
              <DealRequestCard deal={booking} />
            </>
          ) : (
            <>
              <BookingChecksPanel bookingId={id} items={checklistItems} />

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
            </>
          )}
        </div>

        {/* lg:top-0 — the rail's natural offset from the scrollport is ~0px
            (proven by screenshot), and sticky enforces its top value even at
            rest. Any positive offset pushes the card below the header card;
            zero is the only value that can never misalign it. */}
        <BookingActivityTimeline
          events={activityEvents}
          className="lg:sticky lg:top-0"
        />
      </div>
    </div>
    </BookingEditModeProvider>
  );
}

/** Boat link + trip date line under the customer name. */
function BookingHeaderMeta({
  booking,
}: {
  booking: Pick<BookingDetails, "boatId" | "boatName" | "boatTimezone" | "startDateTime">;
}) {
  const parsed = booking.startDateTime
    ? parseDateTimeInBoatTimezone(
        typeof booking.startDateTime === "string"
          ? booking.startDateTime
          : booking.startDateTime.toISOString(),
        { timezone: booking.boatTimezone ?? undefined }
      )
    : null;
  const tripDate = parsed?.date ? format(parsed.date, "EEE, MMM d, yyyy") : null;

  if (!booking.boatName && !tripDate) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      {booking.boatId && booking.boatName ? (
        <Link
          href={`/admin/boats/${booking.boatId}`}
          className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
        >
          <Ship className="h-3.5 w-3.5" />
          {booking.boatName}
        </Link>
      ) : booking.boatName ? (
        <span className="inline-flex items-center gap-1">
          <Ship className="h-3.5 w-3.5" />
          {booking.boatName}
        </span>
      ) : null}
      {booking.boatName && tripDate ? <span aria-hidden>·</span> : null}
      {tripDate ? <span>{tripDate}</span> : null}
    </span>
  );
}
