/**
 * Shared data fetching for Create Booking and Create Booking Group pages.
 * Boats and users are fetched client-side by BoatSelect and UserSelect.
 */

import { db } from "@/database/db";
import { boatPricingTiers } from "@/database/schema";
import { eq } from "drizzle-orm";
import { inquiryService } from "@/features/inquiries/inquiry.service";

export async function getCreateBookingFormData(inquiryId?: string | null) {
  const inquiry = inquiryId ? await inquiryService.getInquiryById(inquiryId) : null;
  const inquiryPrefill = inquiry
    ? {
        customerName: inquiry.name,
        customerEmail: inquiry.email,
        customerPhone: inquiry.phone ?? "",
        specialRequests: inquiry.message ?? undefined,
        numberOfPassengers: inquiry.guests ?? 6,
      }
    : undefined;

  const pricingTiers = await db
    .select({
      id: boatPricingTiers.id,
      boatId: boatPricingTiers.boatId,
      hours: boatPricingTiers.hours,
      price: boatPricingTiers.price,
      name: boatPricingTiers.name,
      isDefault: boatPricingTiers.isDefault,
    })
    .from(boatPricingTiers)
    .where(eq(boatPricingTiers.isActive, true))
    .orderBy(boatPricingTiers.hours);

  return {
    pricingTiers,
    inquiryId: inquiryId ?? undefined,
    inquiryPrefill,
  };
}
