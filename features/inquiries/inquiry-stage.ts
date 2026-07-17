import { db } from "@/database/db";
import { inquiry as inquiryTable, inquiryEvents, type InquiryStage } from "@/database/schema";
import { eq } from "drizzle-orm";

/**
 * Pipeline progression rank. Automation only ever moves a lead FORWARD —
 * an admin who already qualified a lead shouldn't see it snap back to
 * CONTACTED because they logged another call. COLD ranks below everything
 * so any real activity revives it into the pipeline.
 * NEEDS_CONTACT is the legacy spelling of NEW and shares its rank.
 */
const STAGE_RANK: Record<InquiryStage, number> = {
  COLD: -1,
  NEW: 0,
  NEEDS_CONTACT: 0,
  CLAIMED: 1,
  CONTACTED: 2,
  QUALIFIED: 3,
  OFFER_SENT: 4,
  CONVERTED: 5,
};

export function stageIsBefore(current: InquiryStage, target: InquiryStage): boolean {
  return STAGE_RANK[current] < STAGE_RANK[target];
}

/**
 * Advance a lead to `target` if it hasn't reached it yet — the single write
 * path for every stage automation (claim, assign, contact, offer, convert).
 * Returns true when the stage actually moved.
 *
 * Writes are sequential, not transactional: the neon-http driver has no
 * transaction support. Stage update goes first so a failure between the two
 * loses only the timeline entry, never the state.
 */
export async function advanceInquiryStage(
  inquiryId: string,
  current: InquiryStage,
  target: InquiryStage,
  actorId: string | null
): Promise<boolean> {
  if (!stageIsBefore(current, target)) return false;

  await db
    .update(inquiryTable)
    .set({ stage: target, updatedAt: new Date() })
    .where(eq(inquiryTable.id, inquiryId));

  await db.insert(inquiryEvents).values({
    inquiryId,
    eventType: "STAGE_CHANGE",
    previousStage: current,
    newStage: target,
    createdBy: actorId,
  });

  return true;
}
