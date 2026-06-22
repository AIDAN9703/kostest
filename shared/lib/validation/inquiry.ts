import * as z from "zod";
import { bookingRequestSchema } from "@/features/_validation/validations";
import { emailSchema, phoneRequiredSchema } from "./common";

/**
 * Shared inquiry validation schemas
 * Single source of truth for all inquiry forms (Request to Book, Term Charter, etc.)
 * Maps to GeneralInquiryInput / createGeneralInquiry (inquiry.actions)
 */

/** Base contact fields - shared across all inquiry types */
const baseContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  phone: phoneRequiredSchema,
});

/** Day charter / Request to Book - date, time, budget, guests + SMS consent */
export const requestToBookSchema = baseContactSchema.extend({
  date: z.string().optional(),
  time: z.string().optional(),
  budget: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().optional(),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  smsConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive SMS messages to submit this form",
  }),
});

/** Term charter - extended fields, formatted into message for DB */
export const termCharterInquirySchema = baseContactSchema.extend({
  startDate: z.string().optional(),
  duration: z.string().optional(),
  destination: z.string().optional(),
  guests: z.string().optional(),
  budget: z.string().optional(),
  accommodations: z.string().optional(),
  message: z.string().optional(),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

/** Contact fields collected on the inquiry details page (step 2). */
export const boatInquiryContactSchema = baseContactSchema.extend({
  message: z.string().max(2000).optional(),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

/** Boat page inquiry — trip picker fields + contact (server action). */
export const boatInquirySchema = bookingRequestSchema.merge(boatInquiryContactSchema);

export type RequestToBookFormData = z.infer<typeof requestToBookSchema>;
export type TermCharterFormData = z.infer<typeof termCharterInquirySchema>;
export type BoatInquiryContactFormData = z.infer<typeof boatInquiryContactSchema>;
export type BoatInquiryFormData = z.infer<typeof boatInquirySchema>;
