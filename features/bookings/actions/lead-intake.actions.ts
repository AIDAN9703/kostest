"use server";

/**
 * Lead intake — every public form and admin-logged lead lands here and
 * becomes a `booking` row at status INQUIRY (docs/UNIFIED_BOOKINGS_PLAN.md).
 * No boat/dates/pricing required yet; the row progresses through the one
 * deal lifecycle from there.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings, boats, boatPricingTiers } from "@/database/schema";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { emailSchema, phoneRequiredSchema } from "@/shared/lib/validation/common";
import {
  boatInquirySchema,
  preferredTimeOfDaySchema,
  termCharterInquirySchema,
} from "@/shared/lib/validation/inquiry";
import { calculateEndDateTime } from "@/shared/lib/utils/date-helpers";
import { calculateBookingPriceFromDollars } from "@/shared/lib/utils/pricing-utils";
import { getAppSettings } from "@/features/app-settings/app-settings.service";

/** Event type for all intake events — matches the backfill's `lead.created`. */
const LEAD_CREATED_EVENT = "lead.created";

function revalidateDealSurfaces() {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

async function logLeadCreated(
  bookingId: string,
  actorId: string | null,
  metadata?: Record<string, unknown>
) {
  await bookingEventsService.logEvent({
    bookingId,
    eventType: LEAD_CREATED_EVENT,
    actorType: actorId ? "admin" : "system",
    actorId,
    channel: actorId ? "admin_portal" : "web",
    displayMessage: "Inquiry received",
    metadata: metadata ?? null,
  });
}

/**
 * Parse a single-number budget string ("5000", "$5,000") to cents.
 * Range labels ("$10,000-$25,000", "Flexible") return null — the label is
 * appended to the customer message instead so nothing is lost.
 */
function parseBudgetCents(budget?: string): number | null {
  if (!budget) return null;
  const match = budget.trim().match(/^\$?\s*([\d,]+(?:\.\d+)?)$/);
  if (!match) return null;
  const dollars = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : null;
}

function parseGuests(guests?: string): number | null {
  if (!guests) return null;
  const n = parseInt(guests, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Keep unparseable budget labels ("$10k–$25k", "Flexible") visible in the message. */
function messageWithBudgetLabel(
  message: string | null | undefined,
  budget: string | undefined
): string | null {
  const label = budget?.trim();
  const labelNeeded = Boolean(label) && parseBudgetCents(budget) == null;
  const parts = [message?.trim() || null, labelNeeded ? `Budget: ${label}` : null].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join("\n\n") : null;
}

// ============================================================================
// General quote (home page / contact page)
// ============================================================================

const generalLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneRequiredSchema,
  /** Plain calendar date "yyyy-MM-dd" — stored as DATE, never a timestamp. */
  date: z.string().optional(),
  timeOfDay: preferredTimeOfDaySchema.optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  smsConsent: z.boolean().default(false),
  source: z.enum(["HOME_PAGE", "CONTACT_PAGE"]).default("HOME_PAGE"),
});

export type GeneralLeadInput = z.input<typeof generalLeadSchema>;

export async function createGeneralLead(data: GeneralLeadInput) {
  try {
    const validated = generalLeadSchema.parse(data);

    const [deal] = await db
      .insert(bookings)
      .values({
        bookingType: "GENERAL_QUOTE",
        bookingStatus: "INQUIRY",
        source: validated.source,
        customerName: validated.name,
        customerEmail: validated.email,
        customerPhone: validated.phone,
        preferredDate: validated.date || null,
        preferredTimeOfDay: validated.timeOfDay ?? (validated.date ? "FLEXIBLE" : null),
        numberOfPassengers: parseGuests(validated.guests),
        budgetCents: parseBudgetCents(validated.budget),
        customerMessage: messageWithBudgetLabel(validated.message, validated.budget),
        termsAccepted: validated.termsAgreed,
        smsConsent: validated.smsConsent,
      })
      .returning({ id: bookings.id });

    if (deal) await logLeadCreated(deal.id, null);
    revalidateDealSurfaces();

    return {
      success: true,
      bookingId: deal?.id ?? null,
      message: "Your inquiry has been submitted successfully. Our team will contact you shortly.",
    };
  } catch (error) {
    console.error("Error creating general lead:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid inquiry data",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return { success: false, error: "Failed to submit your inquiry. Please try again." };
  }
}

// ============================================================================
// Term charter (multi-day landing page)
// ============================================================================

export type TermCharterLeadInput = z.input<typeof termCharterInquirySchema>;

/** Form duration buckets → minimum days (Flexible → null). */
const TERM_DURATION_TO_DAYS: Record<string, number | null> = {
  "3-6 days": 3,
  "1 week": 7,
  "2 weeks": 14,
  "3+ weeks": 21,
  Flexible: null,
};

export async function createTermCharterLead(data: TermCharterLeadInput) {
  try {
    const validated = termCharterInquirySchema.parse(data);

    const message =
      [
        validated.message?.trim() || null,
        validated.accommodations?.trim()
          ? `Accommodations: ${validated.accommodations.trim()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n\n") || null;

    const [deal] = await db
      .insert(bookings)
      .values({
        bookingType: "TERM_CHARTER",
        bookingStatus: "INQUIRY",
        source: "TERM_CHARTER_PAGE",
        customerName: validated.name,
        customerEmail: validated.email,
        customerPhone: validated.phone,
        preferredDate: validated.startDate || null,
        requestedDurationDays: validated.duration
          ? (TERM_DURATION_TO_DAYS[validated.duration] ?? null)
          : null,
        destination: validated.destination || null,
        isMultiDay: true,
        numberOfPassengers: parseGuests(validated.guests),
        budgetCents: parseBudgetCents(validated.budget),
        customerMessage: messageWithBudgetLabel(message, validated.budget),
        termsAccepted: validated.termsAgreed,
      })
      .returning({ id: bookings.id });

    if (deal) await logLeadCreated(deal.id, null);
    revalidateDealSurfaces();

    return {
      success: true,
      bookingId: deal?.id ?? null,
      message:
        "Your term charter request has been submitted. Our specialists will contact you shortly.",
    };
  } catch (error) {
    console.error("Error creating term charter lead:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid inquiry data",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return { success: false, error: "Failed to submit your inquiry. Please try again." };
  }
}

// ============================================================================
// Boat inquiry (public boat page, non-instant boats)
// ============================================================================

export type BoatLeadInput = z.input<typeof boatInquirySchema> & { boatId: string };

/**
 * Boat-specific lead: the customer already chose a boat, tier, and exact
 * window, so the row carries real trip fields + an estimated value — but it
 * is still an INQUIRY (no payment, no calendar block) until an admin prices
 * and proposes it.
 */
export async function createBoatLead(data: BoatLeadInput) {
  try {
    const validated = boatInquirySchema.parse(data);
    const { boatId } = data;

    const [boat] = await db
      .select({
        id: boats.id,
        cleaningFee: boats.cleaningFee,
        crewRequired: boats.crewRequired,
      })
      .from(boats)
      .where(eq(boats.id, boatId));

    if (!boat) {
      return { success: false, error: "Boat not found" };
    }

    const [pricingTier] = await db
      .select()
      .from(boatPricingTiers)
      .where(
        and(eq(boatPricingTiers.id, validated.pricingTierId), eq(boatPricingTiers.boatId, boatId))
      );

    if (!pricingTier) {
      return { success: false, error: "Invalid pricing tier selected" };
    }

    const startDateTime = new Date(validated.startDateTime);
    const endDateTime = calculateEndDateTime(startDateTime, pricingTier.hours);
    const needsCaptain = validated.needsCaptain || boat.crewRequired || false;

    const { serviceFeeRate } = await getAppSettings();
    const priceBreakdown = calculateBookingPriceFromDollars(
      pricingTier.price,
      boat.cleaningFee || 0,
      0,
      serviceFeeRate
    );

    const [deal] = await db
      .insert(bookings)
      .values({
        bookingType: "BOAT_REQUEST",
        bookingStatus: "INQUIRY",
        source: "BOAT_PAGE",
        boatId,
        pricingTierId: validated.pricingTierId,
        customerName: validated.name,
        customerEmail: validated.email,
        customerPhone: validated.phone,
        customerMessage: validated.message || null,
        numberOfPassengers: validated.numberOfPassengers,
        startDateTime,
        endDateTime,
        isMultiDay: false,
        needsCaptain,
        estimatedValueCents: priceBreakdown.totalPriceCents,
        termsAccepted: validated.termsAgreed,
      })
      .returning({ id: bookings.id });

    if (deal) await logLeadCreated(deal.id, null);
    revalidateDealSurfaces();
    revalidatePath(`/boats/${boatId}`);

    return {
      success: true,
      bookingId: deal?.id ?? null,
      message:
        "Your request has been submitted. Our team will review availability and contact you shortly.",
    };
  } catch (error) {
    console.error("Error creating boat lead:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid request data",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return { success: false, error: "Failed to submit your request. Please try again." };
  }
}

// (Manual "log lead" intake removed 2026-07-21 — the admin's one door is the
// Add booking flow; inquiries only arrive from customer-facing forms above.)
