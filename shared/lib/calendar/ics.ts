/**
 * Tiny RFC 5545 ICS builder for KOS booking feeds.
 *
 * Keeps the implementation in-house (no npm dependency) because the format we
 * emit is narrow: VEVENT only, no recurrence rules, no alarms, no attendees.
 * If we ever need RRULE / ATTENDEE / VALARM we should reach for the `ics`
 * package instead of growing this file.
 */

const PRODID = "-//KOS Yachts//Bookings//EN";

export interface IcsEvent {
  /** Stable, globally unique id — Google/Apple use this to update existing events on refresh. */
  uid: string;
  /** Booking start (UTC anchor). */
  start: Date;
  /** Booking end (UTC anchor). When missing, we treat it as a 1-hour block. */
  end?: Date | null;
  summary: string;
  description?: string;
  location?: string;
  /** Optional URL to deep-link the calendar entry back into KOS. */
  url?: string;
  /** Optional status: CONFIRMED | TENTATIVE | CANCELLED (defaults to CONFIRMED). */
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
}

/** Pad a number with a leading zero to width 2. */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a JS Date as `YYYYMMDDTHHmmssZ` (UTC, basic-format). */
function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/** RFC 5545 §3.3.11 — escape `\` `;` `,` and newlines in TEXT property values. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** RFC 5545 §3.1 — content lines must not exceed 75 octets; fold with CRLF + space. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    // First chunk keeps full 75, subsequent chunks 74 (leading space is the continuation marker).
    const size = i === 0 ? 75 : 74;
    chunks.push(line.slice(i, i + size));
    i += size;
  }
  return chunks.join("\r\n ");
}

function appendProp(out: string[], name: string, rawValue: string) {
  out.push(foldLine(`${name}:${rawValue}`));
}

function appendTextProp(out: string[], name: string, rawValue: string) {
  out.push(foldLine(`${name}:${escapeText(rawValue)}`));
}

export function buildIcs(events: IcsEvent[], calendarName?: string): string {
  const now = toIcsUtc(new Date());
  const out: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:${PRODID}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];

  if (calendarName) {
    appendTextProp(out, "X-WR-CALNAME", calendarName);
    appendTextProp(out, "NAME", calendarName);
  }

  for (const e of events) {
    const dtEnd =
      e.end ?? new Date(e.start.getTime() + 60 * 60 * 1000); // default to +1h if missing
    out.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcsUtc(e.start)}`,
      `DTEND:${toIcsUtc(dtEnd)}`,
    );
    appendTextProp(out, "SUMMARY", e.summary);
    if (e.description) appendTextProp(out, "DESCRIPTION", e.description);
    if (e.location) appendTextProp(out, "LOCATION", e.location);
    if (e.url) appendProp(out, "URL", e.url);
    appendProp(out, "STATUS", e.status ?? "CONFIRMED");
    out.push("END:VEVENT");
  }

  out.push("END:VCALENDAR");
  // RFC 5545 requires CRLF line endings.
  return out.join("\r\n") + "\r\n";
}
