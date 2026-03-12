import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Inquiry stage - where in the pipeline (milestone)
 */
export const inquiryStageEnum = pgEnum("InquiryStage", [
  "NEEDS_CONTACT",  // New, awaiting first outreach
  "CONTACTED",      // First contact made
  "CONVERTED",      // Booking created from inquiry
]);

/**
 * Inquiry outcome - disposition (open vs closed)
 */
export const inquiryOutcomeEnum = pgEnum("InquiryOutcome", [
  "OPEN",      // Active, in progress
  "WON",       // Converted/booked
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
export type InquiryStage =
  (typeof inquiryStageEnum.enumValues)[number];
export type InquiryOutcome =
  (typeof inquiryOutcomeEnum.enumValues)[number];
