import * as z from "zod";
import {
  bookingStatusEnum,
  bookingTypeEnum,
} from "@/database/schema";
import { PAYMENT_DISPLAY_STATUSES } from "@/shared/lib/utils/payment-display";

/**
 * Booking filter/search schema for URL params - Comprehensive filters for admin
 * Uses database enums as single source of truth (matches searchParams).
 */
export const bookingFilterSchema = z.object({
  // Pagination
  page: z.coerce.number().optional(),
  limit: z.coerce.number().max(100).optional(),
  
  // Text search
  search: z.string().optional(),
  
  // Status filters (from database schema)
  bookingStatus: z.enum(bookingStatusEnum.enumValues).optional(),
  paymentStatus: z.enum(PAYMENT_DISPLAY_STATUSES).optional(),
  bookingType: z.enum(bookingTypeEnum.enumValues).optional(),
  
  // Date range
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  
  // Related entities
  boatId: z.string().uuid("Invalid boat ID").optional(),
  bookingGroupId: z.string().uuid("Invalid booking group ID").optional(),
  customerId: z.string().uuid("Invalid customer ID").optional(),
  assignedAdminId: z.string().uuid("Invalid admin ID").optional(),
  
  // Boolean filters
  needsCaptain: z.coerce.boolean().optional(),
  
  // Amount range
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
});

// Inferred type from validation schema
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;

/**
 * Booking update schema for admin edits
 * 
 * PRICING LOGIC:
 * - If pricingTierId changes → basePrice recalculated from tier → all fees recalculated
 * - If boatId changes → cleaningFee recalculated from new boat → all fees recalculated
 * - If cleaningFee manually set → serviceFee and totalAmount recalculated
 * - If captainFee manually set → serviceFee and totalAmount recalculated
 * - If basePrice manually set (when pricingTierId is null) → all fees recalculated
 * - totalAmount is ALWAYS calculated (never manually set) unless manualOverride is true
 * 
 * TIMEZONE LOGIC:
 * - Dates are stored in UTC (timestamptz)
 * - When editing, dates must be converted from boat's timezone to UTC
 * - boatId or boatTimezone must be provided for proper conversion
 */
export const bookingUpdateSchema = z.object({
  // Customer information
  customerName: z.string().min(1, "Customer name is required").optional(),
  customerEmail: z.string().email("Invalid email address").optional(),
  customerPhone: z.string().min(1, "Customer phone is required").optional(),
  
  // Booking details
  numberOfPassengers: z.number().int().min(1, "Must have at least 1 passenger").optional(),
  startDateTime: z.string().datetime().optional(), // ISO string - will be converted to UTC using boat timezone
  endDateTime: z.string().datetime().nullable().optional(), // ISO string - will be converted to UTC using boat timezone
  pickupLocation: z.string().nullable().optional(),
  dropoffLocation: z.string().nullable().optional(),
  needsCaptain: z.boolean().optional(),
  
  // Boat and pricing (triggers recalculation)
  boatId: z.string().uuid("Invalid boat ID").optional(),
  pricingTierId: z.string().uuid("Invalid pricing tier ID").nullable().optional(),
  
  // Manual pricing overrides (triggers recalculation unless manualOverride is true)
  // These are optional - if not provided, values are calculated from pricingTierId and boatId
  basePrice: z.number().min(0, "Base price must be positive").optional(), // Only used if pricingTierId is null
  cleaningFee: z.number().min(0, "Cleaning fee must be positive").nullable().optional(),
  captainFee: z.number().min(0, "Captain fee must be positive").nullable().optional(),
  
  // Manual total override (only if manualOverride is true)
  // If false, totalAmount is always recalculated from basePrice + fees
  manualOverride: z.boolean().optional(), // If true, allows manual totalAmount override
  totalAmount: z.number().min(0, "Total amount must be positive").optional(), // Only used if manualOverride is true
}).refine(
  (data) => {
    // If manualOverride is true, totalAmount must be provided
    if (data.manualOverride === true && data.totalAmount === undefined) {
      return false;
    }
    return true;
  },
  {
    message: "totalAmount is required when manualOverride is true",
    path: ["totalAmount"],
  }
).refine(
  (data) => {
    // If basePrice is provided, pricingTierId must be null or undefined (manual override)
    if (data.basePrice !== undefined && data.pricingTierId !== null && data.pricingTierId !== undefined) {
      return false;
    }
    return true;
  },
  {
    message: "Cannot set basePrice when pricingTierId is provided. Set pricingTierId to null for manual pricing.",
    path: ["basePrice"],
  }
);

export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;

/**
 * Single booking section - resolved on client (full data per booking)
 * Option C: pricingTierId optional. When null = custom pricing, basePrice + endDateTime required.
 */
export const bookingSectionSchema = z
  .object({
    boatId: z.string().uuid("Please select a boat"),
    usePricingTier: z.boolean().optional(),
    pricingTierId: z.string().uuid().nullable().optional(),
    basePrice: z.number().min(0, "Base price must be 0 or greater"),
    depositAmount: z.number().min(0).nullable().optional(),
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z.string().email("Invalid email"),
    customerPhone: z.string().optional().nullable(),
    userId: z.string().uuid().nullable().optional(),
    startDateTime: z.string().datetime("Please select start date and time"),
    endDateTime: z.string().datetime().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.usePricingTier) {
        return !!data.pricingTierId && z.string().uuid().safeParse(data.pricingTierId).success;
      }
      return true;
    },
    { message: "Please select a pricing tier or switch to custom pricing", path: ["pricingTierId"] }
  )
  .refine(
    (data) => {
      // Custom pricing (no tier): endDateTime required
      if (!data.pricingTierId) {
        return !!data.endDateTime;
      }
      return true;
    },
    { message: "End date & time required for custom pricing", path: ["endDateTime"] }
  )
  .refine(
    (data) => {
      // Custom pricing (no tier): basePrice required
      if (!data.pricingTierId) {
        return data.basePrice > 0;
      }
      return true;
    },
    { message: "Base price required for custom pricing", path: ["basePrice"] }
  );

/** Add-on input schema - matches BookingAddOnInput */
export const bookingAddOnSchema = z.object({
  name: z.string().min(1, "Add-on name is required"),
  description: z.string().nullable().optional(),
  unitPrice: z.number().min(0.01, "Unit price must be greater than 0"),
  quantity: z.number().int().min(1),
});

/**
 * Unified create bookings schema - one or more bookings in a group
 */
export const createBookingsSchema = z.object({
  numberOfPassengers: z.number().int().min(1, "Must have at least 1 passenger"),
  pickupLocation: z.string().nullable().optional(),
  dropoffLocation: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
  bookings: z.array(bookingSectionSchema).min(1, "At least one booking is required"),
  lineItems: z.array(bookingAddOnSchema).optional().default([]),
  groupName: z.string().nullable().optional(),
  allowPayment: z.boolean().optional().default(false),
  paymentType: z.enum(["DEPOSIT_ONLY", "FULL_PAYMENT"]).optional().default("FULL_PAYMENT"),
  sendProposalEmail: z.boolean().optional().default(false),
  sendProposalSms: z.boolean().optional().default(false),
  publishNow: z.boolean().optional(),
});

export type CreateBookingsInput = z.infer<typeof createBookingsSchema>;