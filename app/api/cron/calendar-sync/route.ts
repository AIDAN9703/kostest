import { NextRequest, NextResponse } from "next/server";

import { syncAllEnabledCalendars } from "@/features/availability/services/external-calendar-sync.service";

// node-ical relies on Node APIs; keep this off the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Periodic sync of every enabled external (iCal) calendar.
 *
 * Triggered by Vercel Cron (see vercel.json). Vercel automatically sends
 * `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env var is set,
 * which we verify here so the endpoint can't be hit by the public.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Refuse to run unsecured in production.
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const startedAt = Date.now();
  const results = await syncAllEnabledCalendars();

  const succeeded = results.filter((r) => r.status === "SUCCESS").length;
  const failed = results.length - succeeded;
  const totalEvents = results.reduce((sum, r) => sum + r.eventCount, 0);

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - startedAt,
    calendars: results.length,
    succeeded,
    failed,
    totalEvents,
    results,
  });
}
