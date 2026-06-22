"use server";

import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import { db } from "@/database/db";
import {
  inquiry as inquiryTable,
  inquiryEvents,
  inquiryOutcomeEnum,
  type InquiryOutcome,
  type InquiryStage,
} from "@/database/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { emailSchema, phoneRequiredSchema } from "@/shared/lib/validation/common";
import { boatInquirySchema } from "@/shared/lib/validation/inquiry";
import { boats, boatPricingTiers } from "@/database/schema";
import { calculateEndDateTime } from "@/shared/lib/utils/date-helpers";
import { calculateBookingPriceFromDollars } from "@/shared/lib/utils/pricing-utils";
import { getAppSettings } from "@/features/app-settings/app-settings.service";
import { format } from "date-fns";

const outcomeSchema = z.enum(["OPEN", "WON", "LOST", "ABANDONED"]);

// Schema for validation - defined inline for server actions
const generalInquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneRequiredSchema,
  date: z.string().optional(),
  time: z.string().optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  termsAccepted: z.boolean().refine(async (val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

// Type for the client to use
export type GeneralInquiryInput = z.input<typeof generalInquirySchema>;

/**
 * Creates a general booking inquiry
 */
export async function createGeneralInquiry(data: GeneralInquiryInput) {
  try {
    // Validate data first
    const validatedData = await generalInquirySchema.parseAsync(data);

    // Create the inquiry in the database
    const result = await db
      .insert(inquiryTable)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date: validatedData.date ? new Date(validatedData.date) : null,
        time: validatedData.time || null,
        budget: validatedData.budget || null,
        guests: validatedData.guests ? parseInt(validatedData.guests) : null,
        message: validatedData.message || null,
        termsAccepted: validatedData.termsAccepted,
        stage: "NEEDS_CONTACT",
        outcome: "OPEN",
        leadType: "GENERAL_QUOTE",
        source: "HOME_PAGE",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create initial CREATED event for timeline
    if (result[0]) {
      await db.insert(inquiryEvents).values({
        inquiryId: result[0].id,
        eventType: "CREATED",
        createdBy: null,
      });
    }

    // Revalidate admin pages that show inquiries
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");

    return {
      success: true,
      inquiry: result[0],
      message: "Your inquiry has been submitted successfully. Our team will contact you shortly.",
    };
  } catch (error) {
    console.error("Error creating general inquiry:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid inquiry data",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: "Failed to submit your inquiry. Please try again.",
    };
  }
}

export type BoatLeadInput = z.input<typeof boatInquirySchema> & { boatId: string };

/**
 * Creates a boat-specific lead from the public boat page (non-instant boats).
 * No auth required — captures trip preferences + contact info as a lead, not a booking.
 */
export async function createBoatLead(data: BoatLeadInput) {
  try {
    const validated = boatInquirySchema.parse(data);
    const { boatId } = data;

    const [boat] = await db
      .select({
        id: boats.id,
        name: boats.name,
        cleaningFee: boats.cleaningFee,
        crewRequired: boats.crewRequired,
        currency: boats.currency,
        instantBook: boats.instantBook,
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

    const legacyTime = format(startDateTime, "HH:mm");

    const [inquiry] = await db
      .insert(inquiryTable)
      .values({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        message: validated.message || null,
        guests: validated.numberOfPassengers,
        date: startDateTime,
        time: legacyTime,
        stage: "NEW",
        outcome: "OPEN",
        leadType: "BOAT_REQUEST",
        source: "BOAT_PAGE",
        boatId,
        pricingTierId: validated.pricingTierId,
        requestedStartDateTime: startDateTime,
        requestedEndDateTime: endDateTime,
        needsCaptain,
        estimatedTotalCents: priceBreakdown.totalPriceCents,
        currency: boat.currency ?? "USD",
        termsAccepted: validated.termsAgreed,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (inquiry) {
      await db.insert(inquiryEvents).values({
        inquiryId: inquiry.id,
        eventType: "CREATED",
        createdBy: null,
      });
    }

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    revalidatePath(`/boats/${boatId}`);

    return {
      success: true,
      inquiry,
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

    return {
      success: false,
      error: "Failed to submit your request. Please try again.",
    };
  }
}

/**
 * Update the outcome of a general inquiry (open -> won/lost/abandoned)
 * Supports reopening closed inquiries (won/lost/abandoned -> open)
 */
export async function updateInquiryOutcome(id: string, newOutcome: string, reason?: string) {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) {
      return { success: false, error: adminAuth.error };
    }
    const session = adminAuth.session;

    const parsedOutcome = outcomeSchema.safeParse(newOutcome);
    if (!parsedOutcome.success) {
      return { success: false, error: "Invalid outcome" };
    }

    const [existing] = await db
      .select({
        outcome: inquiryTable.outcome,
        stage: inquiryTable.stage,
      })
      .from(inquiryTable)
      .where(eq(inquiryTable.id, id));

    if (!existing) {
      return { success: false, error: "Inquiry not found" };
    }

    const previousOutcome = existing.outcome;
    if (previousOutcome === newOutcome) {
      return { success: true, inquiry: null };
    }

    const updateData: Record<string, unknown> = {
      outcome: newOutcome,
      updatedAt: new Date(),
    };

    // If reopening (closed -> OPEN), reset stage appropriately
    if (previousOutcome !== "OPEN" && newOutcome === "OPEN") {
      if (existing.stage === "CONVERTED") {
        updateData.stage = "CONTACTED";
      }
    }

    const [result] = await db
      .update(inquiryTable)
      .set(updateData)
      .where(eq(inquiryTable.id, id))
      .returning();

    const outcomePayload = {
      inquiryId: id,
      eventType: "OUTCOME_CHANGE" as const,
      previousOutcome: previousOutcome as InquiryOutcome,
      newOutcome: newOutcome as InquiryOutcome,
      content: reason?.trim() || null,
      metadata: reason ? { reason } : null,
      createdBy: session.user.id,
    };
    await db.insert(inquiryEvents).values(outcomePayload);

    const newStageValue = updateData.stage;
    if (newStageValue && newStageValue !== existing.stage) {
      await db.insert(inquiryEvents).values({
        inquiryId: id,
        eventType: "STAGE_CHANGE",
        previousStage: existing.stage as InquiryStage,
        newStage: newStageValue as InquiryStage,
        createdBy: session.user.id,
      });
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);

    return { success: true, inquiry: result };
  } catch (error) {
    console.error("Error updating inquiry outcome:", error);
    return { success: false, error: "Failed to update inquiry outcome" };
  }
}

/**
 * Add a note to an inquiry (creates NOTE event)
 */
export async function addInquiryNote(inquiryId: string, content: string) {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) {
      return { success: false, error: adminAuth.error };
    }
    const session = adminAuth.session;

    const trimmed = content?.trim();
    if (!trimmed) {
      return { success: false, error: "Note content is required" };
    }

    await db.insert(inquiryEvents).values({
      inquiryId,
      eventType: "NOTE",
      content: trimmed,
      createdBy: session.user.id,
    });

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding inquiry note:", error);
    return { success: false, error: "Failed to add note" };
  }
}

/**
 * Log a contact attempt (creates CONTACT_ATTEMPT event)
 * Automatically updates stage from NEEDS_CONTACT → CONTACTED if this is the first contact
 */
export async function logContactAttempt(
  inquiryId: string,
  contactMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "OTHER",
  content?: string
) {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) {
      return { success: false, error: adminAuth.error };
    }
    const session = adminAuth.session;

    const [inquiryRow] = await db
      .select({ stage: inquiryTable.stage, outcome: inquiryTable.outcome })
      .from(inquiryTable)
      .where(eq(inquiryTable.id, inquiryId));

    if (!inquiryRow) {
      return { success: false, error: "Inquiry not found" };
    }

    await db.insert(inquiryEvents).values({
      inquiryId,
      eventType: "CONTACT_ATTEMPT",
      contactMethod,
      content: content?.trim() || null,
      createdBy: session.user.id,
    });

    let stageUpdated = false;
    if (inquiryRow.stage === "NEEDS_CONTACT" && inquiryRow.outcome === "OPEN") {
      await db
        .update(inquiryTable)
        .set({
          stage: "CONTACTED",
          updatedAt: new Date(),
        })
        .where(eq(inquiryTable.id, inquiryId));

      await db.insert(inquiryEvents).values({
        inquiryId,
        eventType: "STAGE_CHANGE",
        previousStage: "NEEDS_CONTACT",
        newStage: "CONTACTED",
        createdBy: session.user.id,
      });

      stageUpdated = true;
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);

    return {
      success: true,
      stageUpdated,
      message: stageUpdated ? "Contact logged and inquiry marked as CONTACTED" : "Contact logged",
    };
  } catch (error) {
    console.error("Error logging contact attempt:", error);
    return { success: false, error: "Failed to log contact attempt" };
  }
}

/**
 * Reopen a closed inquiry (WON/LOST/ABANDONED → OPEN)
 */
export async function reopenInquiry(inquiryId: string) {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) {
      return { success: false, error: adminAuth.error };
    }
    const session = adminAuth.session;

    const [inquiryRow] = await db
      .select({
        outcome: inquiryTable.outcome,
        stage: inquiryTable.stage,
      })
      .from(inquiryTable)
      .where(eq(inquiryTable.id, inquiryId));

    if (!inquiryRow) {
      return { success: false, error: "Inquiry not found" };
    }

    if (inquiryRow.outcome === "OPEN") {
      return { success: false, error: "Inquiry is already open" };
    }

    const previousOutcome = inquiryRow.outcome;

    type ReopenUpdatePayload = {
      outcome: "OPEN";
      updatedAt: Date;
      stage?: InquiryStage;
    };
    const updateData: ReopenUpdatePayload = {
      outcome: "OPEN",
      updatedAt: new Date(),
    };

    if (inquiryRow.stage === "CONVERTED") {
      updateData.stage = "CONTACTED";
    }

    await db.update(inquiryTable).set(updateData).where(eq(inquiryTable.id, inquiryId));

    await db.insert(inquiryEvents).values({
      inquiryId,
      eventType: "OUTCOME_CHANGE",
      previousOutcome,
      newOutcome: "OPEN",
      content: `Reopened from ${previousOutcome}`,
      createdBy: session.user.id,
    });

    if (updateData.stage && updateData.stage !== inquiryRow.stage) {
      await db.insert(inquiryEvents).values({
        inquiryId,
        eventType: "STAGE_CHANGE",
        previousStage: inquiryRow.stage,
        newStage: updateData.stage,
        createdBy: session.user.id,
      });
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);

    return { success: true, message: "Inquiry reopened successfully" };
  } catch (error) {
    console.error("Error reopening inquiry:", error);
    return { success: false, error: "Failed to reopen inquiry" };
  }
}
