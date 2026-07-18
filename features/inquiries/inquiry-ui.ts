import { format } from "date-fns";
import { formatPlainDate } from "@/shared/lib/utils/general-utils";

/**
 * Shared display vocabulary for inquiries — one source of truth for badges,
 * labels, and the trip-intent summary used on the dashboard, the inquiries
 * list, and the inquiry detail page.
 *
 * This module is server-safe: no "use client". Pure helpers live here so both
 * Server Components and client components can call them.
 */

/** Minimal admin identity used for assignment UI. */
export type AdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username?: string | null;
  profileImage: string | null;
};

export function adminDisplayName(a: Pick<AdminOption, "firstName" | "lastName" | "email">) {
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email;
}

export function adminInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const LEAD_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  GENERAL_QUOTE: { label: "General", className: "bg-muted text-muted-foreground" },
  BOAT_REQUEST: { label: "Boat", className: "bg-primary-soft text-primary-strong" },
  TERM_CHARTER: {
    label: "Term",
    className: "bg-warning-soft text-warning",
  },
  MANUAL: { label: "Manual", className: "bg-muted text-muted-foreground" },
  MARKETPLACE: {
    label: "Marketplace",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
};

export const SOURCE_LABELS: Record<string, string> = {
  HOME_PAGE: "Home page",
  BOAT_PAGE: "Boat page",
  CONTACT_PAGE: "Contact page",
  TERM_CHARTER_PAGE: "Term charter page",
  PHONE: "Phone",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  ADMIN: "Admin",
  BROKER: "Broker",
  BOATSETTER: "Boatsetter",
  GETMYBOAT: "GetMyBoat",
  OTHER: "Other",
};

export const TIME_OF_DAY_LABELS: Record<string, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  FLEXIBLE: "Flexible",
};

export const STAGE_LABELS: Record<string, string> = {
  NEEDS_CONTACT: "New", // legacy value — same as NEW
  NEW: "New",
  CLAIMED: "Claimed",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  OFFER_SENT: "Offer sent",
  CONVERTED: "Converted",
  COLD: "Cold",
};

export const OUTCOME_LABELS: Record<string, string> = {
  OPEN: "Open",
  WON: "Won",
  LOST: "Lost",
  ABANDONED: "Archived",
};

/** Soft tinted avatar per lead type — the row's leading identity mark. */
export const LEAD_TYPE_AVATAR_TINTS: Record<string, string> = {
  GENERAL_QUOTE: "bg-muted text-muted-foreground",
  BOAT_REQUEST: "bg-primary-soft text-primary-strong",
  TERM_CHARTER: "bg-warning-soft text-warning",
  MANUAL: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
  MARKETPLACE: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
};

export const OUTCOME_CHIP_CLASSES: Record<string, string> = {
  OPEN: "bg-muted text-muted-foreground",
  WON: "bg-success-soft text-success",
  LOST: "bg-destructive-soft text-destructive",
  ABANDONED: "bg-muted text-muted-foreground",
};

/** Fields shared by every lead shape (list item, full row) used in summaries. */
type LeadTripFields = {
  requestedStartDateTime?: Date | string | null;
  preferredDate?: string | null;
  preferredTimeOfDay?: string | null;
  requestedDurationDays?: number | null;
  destination?: string | null;
  guests?: number | null;
  date?: Date | string | null;
};

/** "Aug 15, 2:00 PM · 7+ days · Bahamas · 6 guests" — best fidelity available. */
export function leadTripSummary(lead: LeadTripFields): string | null {
  const parts: string[] = [];
  if (lead.requestedStartDateTime) {
    parts.push(format(new Date(lead.requestedStartDateTime), "MMM d, h:mm a"));
  } else if (lead.preferredDate) {
    parts.push(formatPlainDate(lead.preferredDate));
    if (lead.preferredTimeOfDay) {
      parts.push(TIME_OF_DAY_LABELS[lead.preferredTimeOfDay] ?? lead.preferredTimeOfDay);
    }
  } else if (lead.date) {
    parts.push(format(new Date(lead.date), "MMM d"));
  }
  if (lead.requestedDurationDays) parts.push(`${lead.requestedDurationDays}+ days`);
  if (lead.destination) parts.push(lead.destination);
  if (lead.guests) parts.push(`${lead.guests} guests`);
  return parts.length > 0 ? parts.join(" · ") : null;
}
