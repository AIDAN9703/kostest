"use server";

/**
 * Lead-phase deal actions on the unified booking hub — logging contact,
 * notes, cold/archive marks, and losing a deal. Everything writes to the
 * one activity feed (booking_event) and derives the one pipeline
 * (docs/UNIFIED_BOOKINGS_PLAN.md).
 */

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings } from "@/database/schema";
import { bookingEventsService } from "@/features/bookings/services/booking-events.service";
import { bookingStatusService } from "@/features/bookings/services/booking-status.service";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";

type DealActionResult = { success: boolean; error?: string; message?: string };

const CONTACT_METHODS = ["EMAIL", "PHONE", "SMS", "IN_PERSON", "OTHER"] as const;
type ContactMethod = (typeof CONTACT_METHODS)[number];

function revalidateDeal(bookingId: string) {
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin");
}

async function getDeal(bookingId: string) {
  const [deal] = await db
    .select({
      id: bookings.id,
      bookingStatus: bookings.bookingStatus,
      firstContactedAt: bookings.firstContactedAt,
      coldAt: bookings.coldAt,
      archivedAt: bookings.archivedAt,
      assignedAdminId: bookings.assignedAdminId,
    })
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  return deal ?? null;
}

/** One-click "this lead is mine" — assigns the deal to the calling admin. */
export async function claimDeal(bookingId: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };
    // Claim ≠ steal: if someone already owns it, reassignment must go through
    // the explicit Assign menu, not a silent last-write-wins.
    if (deal.assignedAdminId && deal.assignedAdminId !== session.user.id) {
      return { success: false, error: "Already claimed by another admin — use Assign to reassign it" };
    }

    await db
      .update(bookings)
      .set({ assignedAdminId: session.user.id, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    await bookingEventsService.logEvent({
      bookingId,
      eventType: "booking.assigned_admin_changed",
      actorType: "admin",
      actorId: session.user.id,
      channel: "admin_portal",
      displayMessage: `Claimed by ${session.user.name || session.user.email || "admin"}`,
      metadata: { assignedTo: session.user.id, claimed: true },
    });

    revalidateDeal(bookingId);
    return { success: true, message: "Lead claimed — it's yours" };
  } catch (error) {
    console.error("Error claiming deal:", error);
    return { success: false, error: "Failed to claim deal" };
  }
}

/**
 * Log a contact attempt. The first one marks the deal "Contacted" on the
 * pipeline (firstContactedAt) — automation, no manual stage clicks.
 */
export async function logDealContact(
  bookingId: string,
  contactMethod: ContactMethod,
  content?: string
): Promise<DealActionResult & { pipelineAdvanced?: boolean }> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    if (!CONTACT_METHODS.includes(contactMethod)) {
      return { success: false, error: "Invalid contact method" };
    }
    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };

    await bookingEventsService.logContact({
      bookingId,
      actorId: session.user.id,
      contactMethod,
      content: content?.trim() || null,
    });

    const pipelineAdvanced = deal.firstContactedAt == null;
    if (pipelineAdvanced) {
      await db
        .update(bookings)
        .set({ firstContactedAt: new Date(), updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
    }

    revalidateDeal(bookingId);
    return {
      success: true,
      pipelineAdvanced,
      message: pipelineAdvanced ? "Contact logged — deal moved to Contacted" : "Contact logged",
    };
  } catch (error) {
    console.error("Error logging deal contact:", error);
    return { success: false, error: "Failed to log contact" };
  }
}

export async function addDealNote(bookingId: string, content: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const trimmed = content?.trim();
    if (!trimmed) return { success: false, error: "Note cannot be empty" };
    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };

    await bookingEventsService.logNote({
      bookingId,
      actorId: session.user.id,
      content: trimmed,
      noteType: "GENERAL",
    });

    revalidateDeal(bookingId);
    return { success: true, message: "Note added" };
  } catch (error) {
    console.error("Error adding deal note:", error);
    return { success: false, error: "Failed to add note" };
  }
}

/** Toggle the cold mark on an INQUIRY-status deal (cold ⇄ revived). */
export async function toggleDealCold(bookingId: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };
    if (deal.bookingStatus !== "INQUIRY") {
      return { success: false, error: "Only inquiry-stage deals can be marked cold" };
    }

    const makingCold = deal.coldAt == null;
    await db
      .update(bookings)
      .set({ coldAt: makingCold ? new Date() : null, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    await bookingEventsService.logEvent({
      bookingId,
      eventType: makingCold ? "lead.marked_cold" : "lead.revived",
      actorType: "admin",
      actorId: session.user.id,
      channel: "admin_portal",
      displayMessage: makingCold ? "Marked cold" : "Revived from cold",
    });

    revalidateDeal(bookingId);
    return { success: true, message: makingCold ? "Marked cold" : "Revived" };
  } catch (error) {
    console.error("Error toggling deal cold:", error);
    return { success: false, error: "Failed to update deal" };
  }
}

/** Archive hides the deal from the default master list (boss's archive bucket). */
export async function toggleDealArchived(bookingId: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };

    const archiving = deal.archivedAt == null;
    await db
      .update(bookings)
      .set({ archivedAt: archiving ? new Date() : null, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    await bookingEventsService.logEvent({
      bookingId,
      eventType: archiving ? "deal.archived" : "deal.unarchived",
      actorType: "admin",
      actorId: session.user.id,
      channel: "admin_portal",
      displayMessage: archiving ? "Archived" : "Restored from archive",
    });

    revalidateDeal(bookingId);
    return { success: true, message: archiving ? "Archived" : "Restored" };
  } catch (error) {
    console.error("Error toggling deal archive:", error);
    return { success: false, error: "Failed to update deal" };
  }
}

/**
 * Copying the proposal link IS publishing it — the customer is about to hold
 * a working URL. Stamps publishedAt on first share so the public draft page
 * (which refuses unpublished tokens) accepts it, and logs the share once.
 */
export async function shareProposalLink(bookingId: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const [row] = await db
      .select({
        id: bookings.id,
        publicToken: bookings.publicToken,
        publishedAt: bookings.publishedAt,
      })
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    if (!row?.publicToken) return { success: false, error: "No proposal link exists for this booking" };

    if (!row.publishedAt) {
      await db
        .update(bookings)
        .set({ publishedAt: new Date(), updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
      await bookingEventsService.logEvent({
        bookingId,
        eventType: "booking.draft_published",
        actorType: "admin",
        actorId: session.user.id,
        channel: "admin_portal",
        displayMessage: "Proposal link shared with the customer",
        metadata: { publicToken: row.publicToken, via: "copy_link" },
      });
      revalidateDeal(bookingId);
    }
    return { success: true };
  } catch (error) {
    console.error("Error sharing proposal link:", error);
    return { success: false, error: "Failed to activate the proposal link" };
  }
}

/** Lose an INQUIRY-stage deal — status CANCELLED with the reason recorded. */
export async function markDealLost(bookingId: string, reason: string): Promise<DealActionResult> {
  try {
    const adminAuth = await getAdminSession();
    if (adminAuth.error !== undefined) return { success: false, error: adminAuth.error };
    const session = adminAuth.session;

    const trimmed = reason?.trim();
    if (!trimmed) return { success: false, error: "A reason is required" };
    const deal = await getDeal(bookingId);
    if (!deal) return { success: false, error: "Deal not found" };

    await bookingStatusService.cancel(bookingId, trimmed, session.user.id);
    // The menu promises "moves to the archive bucket" — make it true.
    await db
      .update(bookings)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));

    revalidateDeal(bookingId);
    return { success: true, message: "Deal marked as lost" };
  } catch (error) {
    console.error("Error marking deal lost:", error);
    return { success: false, error: "Failed to mark deal as lost" };
  }
}
