"use server";

import { ZodError } from "zod";
import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingExpenseLineService } from "@/features/bookings/services/booking-expense-line.service";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";
import {
  createBookingFullSchema,
  type CreateBookingFullInput,
} from "@/features/bookings/booking.validation";
import { sendDraftBookingEmail } from "@/shared/lib/services/email.service";
import { sendSms } from "@/shared/lib/services/twilio.service";
import { getBaseUrl } from "@/shared/lib/utils/base-url";
import type { ActionResponse } from "@/shared/lib/types/types";

function formatZodError(error: ZodError): string {
  const first = error.errors[0];
  if (!first) return "Validation failed";
  const path = first.path.filter(Boolean).join(".");
  return path ? `${path}: ${first.message}` : first.message;
}

type CreateBookingFullResult = {
  bookingId: string;
  publicToken: string | null;
  groupId: string | null;
  proposalSent: boolean;
};

/**
 * Unified "new booking modal" action.
 *
 * Wraps the existing booking pipeline (createBookings → pricing → status history
 * → booking.created event) and additionally persists the financial/ops data the
 * admin captures up front: owner payout + other expense lines (booking_expense_line)
 * and GMV / source / sales agent (booking_ops). Always creates a SINGLE booking —
 * no booking group is involved. Reuses the same Stripe-link proposal email/SMS path
 * as createBookingsAction.
 */
export async function createBookingFull(
  rawInput: CreateBookingFullInput
): Promise<ActionResponse<CreateBookingFullResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    const adminId = session.user.id;

    const input = createBookingFullSchema.parse(rawInput);

    const sendProposalEmail = input.sendProposalEmail ?? false;
    const sendProposalSms = input.sendProposalSms ?? false;
    const publishNow = sendProposalEmail || sendProposalSms;

    // 1. Core booking (single element → no group). Reuses all existing
    //    pricing + status-history + booking.created audit behavior.
    const result = await bookingService.createBookings(
      {
        numberOfPassengers: input.numberOfPassengers,
        pickupLocation: input.pickupLocation ?? null,
        dropoffLocation: input.dropoffLocation ?? null,
        adminNotes: input.adminNotes ?? null,
        bookings: [input.booking],
        lineItems: input.lineItems ?? [],
        groupName: null,
        allowPayment: input.allowPayment ?? false,
        paymentType: input.paymentType ?? "FULL_PAYMENT",
        sendProposalEmail,
        sendProposalSms,
        publishNow,
      },
      adminId
    );

    const bookingId = result.bookingIds[0];
    if (!bookingId) {
      return { success: false, error: "Booking was not created" };
    }

    // 2. Expense lines (owner payout + categorized others). saveLines also
    //    aggregates OWNER_PAYOUT into booking_ops.expense_cents.
    if (input.expenseLines.length > 0) {
      await bookingExpenseLineService.saveLines(
        bookingId,
        input.expenseLines.map((line, index) => ({
          category: line.category,
          amountCents: line.amountCents,
          label: line.label ?? null,
          sortOrder: line.sortOrder ?? index,
          source: line.source ?? "MANUAL",
        }))
      );
    }

    // 3. Ops fields (GMV, source, sales agent).
    const hasOps =
      input.gmvCents != null ||
      (input.source?.trim() ?? "") !== "" ||
      (input.agentCode?.trim() ?? "") !== "";
    if (hasOps) {
      await bookingOpsService.upsert(bookingId, {
        gmvCents: input.gmvCents ?? null,
        sourceOverride: input.source?.trim() || null,
        agentCode: input.agentCode?.trim() || null,
      });
    }

    // 4. Audit the financials capture (creation itself is already logged as
    //    booking.created via createInitialHistory).
    if (input.expenseLines.length > 0 || hasOps) {
      const ownerPayoutCents = input.expenseLines
        .filter((l) => l.category === "OWNER_PAYOUT")
        .reduce((sum, l) => sum + l.amountCents, 0);
      await bookingEventsService.logEvent({
        bookingId,
        eventType: BOOKING_EVENT_TYPES.UPDATED,
        actorType: "admin",
        actorId: adminId,
        channel: "admin_portal",
        displayMessage: "Financials captured at booking creation",
        newState: {
          gmvCents: input.gmvCents ?? null,
          ownerPayoutCents,
          expenseLineCount: input.expenseLines.length,
          source: input.source?.trim() || null,
          agentCode: input.agentCode?.trim() || null,
        },
      });
    }

    // 5. Proposal send (only Stripe-link path is wired). Mirrors createBookingsAction.
    const baseUrl = getBaseUrl();
    const draftLink = result.publicToken
      ? `${baseUrl}/bookings/draft/${result.publicToken}`
      : null;

    if (draftLink && publishNow) {
      const b = input.booking;
      if (sendProposalEmail) {
        sendDraftBookingEmail({
          customerName: b.customerName,
          customerEmail: b.customerEmail,
          draftLink,
          isGroup: false,
        }).catch((err) => console.error("Draft email failed:", err));
      }
      if (sendProposalSms && b.customerPhone?.trim()) {
        sendSms(
          b.customerPhone,
          `Kings Of The Sea: Your charter proposal is ready. View & accept: ${draftLink}`
        ).catch((err) => console.error("Draft SMS failed:", err));
      }
    }

    return {
      success: true,
      data: {
        bookingId,
        publicToken: result.publicToken,
        groupId: result.groupId,
        proposalSent: publishNow,
      },
    };
  } catch (error) {
    console.error("createBookingFull error:", error);
    if (error instanceof ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}
