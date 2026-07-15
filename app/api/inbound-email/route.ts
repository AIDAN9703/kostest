import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { inboundEmails } from "@/database/schema";
import {
  MARKETPLACE_SENDER_DOMAINS,
  htmlToText,
  processMarketplaceEmail,
} from "@/features/inquiries/services/inbound-lead.service";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1_000_000; // 1MB — notification emails are tiny
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

/**
 * Verify the Resend webhook signature (svix scheme):
 * HMAC-SHA256 over `${svix-id}.${svix-timestamp}.${body}` with the base64
 * portion of the whsec_ secret; header carries space-separated "v1,<sig>".
 */
function verifySignature(payload: string, headers: Headers, secret: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > TIMESTAMP_TOLERANCE_SECONDS) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", secretBytes)
    .update(`${id}.${timestamp}.${payload}`)
    .digest();

  return signatureHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const candidate = Buffer.from(sig, "base64");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

/** Pull an email address out of "Name <a@b.com>", {email}, or arrays thereof. */
function extractAddress(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return extractAddress(value[0]);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return extractAddress(obj.email ?? obj.address ?? null);
  }
  if (typeof value === "string") {
    return value.match(/<([^>]+)>/)?.[1]?.trim() ?? value.trim();
  }
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RESEND_INBOUND_WEBHOOK_SECRET is not set — rejecting inbound email");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const payload = await request.text();
  if (payload.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  if (!verifySignature(payload, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resend wraps the email in `data`; tolerate both shapes.
  const data = (event.data ?? event) as Record<string, unknown>;
  const headersObj = (data.headers ?? {}) as Record<string, unknown>;

  const fromAddress = extractAddress(data.from);
  const toAddress = extractAddress(data.to);
  const subject = typeof data.subject === "string" ? data.subject : "";
  const rawHtml = typeof data.html === "string" ? data.html : null;
  const rawText = typeof data.text === "string" ? data.text : null;
  const messageId =
    (typeof data.message_id === "string" && data.message_id) ||
    (typeof data.messageId === "string" && data.messageId) ||
    (typeof headersObj["message-id"] === "string" && (headersObj["message-id"] as string)) ||
    (typeof event.id === "string" && (event.id as string)) ||
    null;

  if (!fromAddress || !messageId) {
    // Not an email payload we understand (e.g. a different Resend event type).
    return NextResponse.json({ ok: true, skipped: "unrecognized payload" });
  }

  // Store raw FIRST (crash-safe), dedupe on messageId.
  const [stored] = await db
    .insert(inboundEmails)
    .values({
      messageId,
      fromAddress,
      toAddress,
      subject,
      rawHtml,
      rawText,
      receivedAt: new Date(),
    })
    .onConflictDoNothing({ target: inboundEmails.messageId })
    .returning({ id: inboundEmails.id });

  if (!stored) {
    return NextResponse.json({ ok: true, skipped: "duplicate" });
  }

  // Classify the sender; unknown senders are stored but ignored.
  const fromDomain = fromAddress.split("@")[1]?.toLowerCase() ?? "";
  const source = Object.entries(MARKETPLACE_SENDER_DOMAINS).find(([domain]) =>
    fromDomain === domain || fromDomain.endsWith(`.${domain}`)
  )?.[1];

  if (!source) {
    await db
      .update(inboundEmails)
      .set({ parseStatus: "IGNORED" })
      .where(eq(inboundEmails.id, stored.id));
    return NextResponse.json({ ok: true, skipped: "unknown sender" });
  }

  try {
    const text = rawText?.trim() || (rawHtml ? htmlToText(rawHtml) : "");
    const { inquiryId, method } = await processMarketplaceEmail({
      source,
      fromAddress,
      subject,
      text,
    });
    await db
      .update(inboundEmails)
      .set({ parseStatus: method, inquiryId })
      .where(eq(inboundEmails.id, stored.id));
    return NextResponse.json({ ok: true, inquiryId, method });
  } catch (error) {
    console.error("Inbound email processing failed:", error);
    await db
      .update(inboundEmails)
      .set({
        parseStatus: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(inboundEmails.id, stored.id));
    // 200 so Resend doesn't hammer retries — the raw email is stored for reprocessing.
    return NextResponse.json({ ok: true, stored: true, parsed: false });
  }
}
