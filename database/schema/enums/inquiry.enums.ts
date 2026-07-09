import { pgEnum } from "drizzle-orm/pg-core";

/** What kind of lead this is (channel-specific intent). */
export const inquiryLeadTypeEnum = pgEnum("InquiryLeadType", [
  "GENERAL_QUOTE",
  "BOAT_REQUEST",
  "TERM_CHARTER",
  "MANUAL",
]);

/** Where the lead originated. */
export const inquirySourceEnum = pgEnum("InquirySource", [
  "HOME_PAGE",
  "BOAT_PAGE",
  "CONTACT_PAGE",
  "TERM_CHARTER_PAGE",
  "PHONE",
  "INSTAGRAM",
  "WHATSAPP",
  "ADMIN",
  "BROKER",
  "OTHER",
]);

/**
 * Fuzzy time-of-day preference for leads that don't have exact times
 * (home page / contact / term charter). Exact times use requestedStartDateTime.
 */
export const preferredTimeOfDayEnum = pgEnum("PreferredTimeOfDay", [
  "MORNING",
  "AFTERNOON",
  "EVENING",
  "FLEXIBLE",
]);

/**
 * Inquiry stage - where in the pipeline (milestone)
 * NEEDS_CONTACT is legacy; treat as NEW in application code.
 */
export const inquiryStageEnum = pgEnum("InquiryStage", [
  "NEEDS_CONTACT", // legacy — same as NEW
  "NEW",
  "CLAIMED",
  "CONTACTED",
  "QUALIFIED",
  "OFFER_SENT",
  "CONVERTED",
  "COLD",
]);

/**
 * Inquiry outcome - disposition (open vs closed)
 */
export const inquiryOutcomeEnum = pgEnum("InquiryOutcome", [
  "OPEN",      // Active, in progress
  "WON",
  "LOST",      // Declined, chose competitor, etc.
  "ABANDONED", // No response, went cold
]);

/**
 * Inquiry event type - for timeline/audit log
 */
export const inquiryEventTypeEnum = pgEnum("InquiryEventType", [
  "CREATED",         // System: inquiry was created
  "STAGE_CHANGE",    // Admin changed pipeline stage
  "OUTCOME_CHANGE",  // Admin changed outcome (open/won/lost/abandoned)
  "NOTE",           // Internal admin note
  "CONTACT_ATTEMPT", // Logged contact (call, email, conversation, etc.)
  "ASSIGNED",        // Lead assigned or claimed by an admin
]);

/**
 * Contact method - how the customer was reached
 */
export const contactMethodEnum = pgEnum("ContactMethod", [
  "EMAIL",
  "PHONE",
  "SMS",
  "IN_PERSON",
  "OTHER",
]);

/** Inferred types for type-safe usage across the app */
export type PreferredTimeOfDay = (typeof preferredTimeOfDayEnum.enumValues)[number];
export type InquiryLeadType = (typeof inquiryLeadTypeEnum.enumValues)[number];
export type InquirySource = (typeof inquirySourceEnum.enumValues)[number];
export type InquiryStage = (typeof inquiryStageEnum.enumValues)[number];
export type InquiryOutcome = (typeof inquiryOutcomeEnum.enumValues)[number];
