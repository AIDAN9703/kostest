"use server";

import { db } from "@/database/db";
import { boats, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateEndDateTime } from "@/shared/lib/utils/date-helpers";
import { eq } from "drizzle-orm";
import { bookingService } from "@/features/bookings/booking.service";
import { ghlWebhookService } from "@/shared/lib/services/ghl-webhook.service";

/**
 * Creates a booking request using the booking service
 * This is used for the standard booking request flow that requires owner approval
 */
export async function createBookingRequest(data: BookingRequest & { boatId: string }) {
  // Check for authentication
  const session = await auth();
  if (!session?.user) {
    return { 
      success: false, 
      error: "You must be signed in to book", 
      errorType: "AUTH"
    };
  }

  try {
    // Validate the booking data
    const validatedData = bookingRequestSchema.parse(data);
    
    // Get the pricing tier details
    const pricingTierResults = await db
      .select()
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.id, validatedData.pricingTierId));
    
    if (pricingTierResults.length === 0) {
      return { 
        success: false, 
        error: "Invalid pricing tier selected" 
      };
    }
    
    const pricingTier = pricingTierResults[0];
    
    // Check availability before creating booking
    const { AvailabilityService } = await import("@/features/availability/services/availability.service");
    const availabilityService = new AvailabilityService();
    
    const startDateTime = new Date(validatedData.startDateTime);
    const endDateTime = calculateEndDateTime(startDateTime, pricingTier.hours);
    
    const availability = await availabilityService.checkTimeSlotAvailability(
      data.boatId,
      startDateTime,
      endDateTime
    );
    
    if (!availability.isAvailable) {
      return {
        success: false,
        error: "Selected time slot is no longer available. Please choose a different time.",
        errorType: "AVAILABILITY"
      };
    }
    
    // Get boat details for validation
    const boatResults = await db
      .select({
        id: boats.id,
        name: boats.name,
        cleaningFee: boats.cleaningFee,
        depositAmount: boats.depositAmount,
        ownerId: boats.ownerId,
        crewRequired: boats.crewRequired,
      })
      .from(boats)
      .where(eq(boats.id, data.boatId));
    
    if (boatResults.length === 0) {
      return { 
        success: false, 
        error: "Boat not found" 
      };
    }
    
    const boat = boatResults[0];
    
    // Use the booking service to create the booking
    // This handles creating the booking, pricing, and status history records
    const booking = await bookingService.createBookingRequest({
      boatId: data.boatId,
      pricingTierId: validatedData.pricingTierId,
      userId: session.user.id,
      customerName: session.user.name || "",
      customerEmail: session.user.email || "",
      customerPhone: session.user.phoneNumber || "",
      startDateTime,
      endDateTime,
      numberOfPassengers: validatedData.numberOfPassengers,
      needsCaptain: validatedData.needsCaptain || boat.crewRequired || false,
      specialRequests: validatedData.specialRequests || null,
    });
    
    // Send GHL webhook for booking request (async, don't block the response)
    sendGHLWebhookForBookingRequest(booking, boat, pricingTier, startDateTime, endDateTime, session.user).catch(error => {
      console.warn('GHL booking request webhook failed:', error);
    });

    // Revalidate relevant paths
    revalidatePath("/profile/bookings");
    revalidatePath(`/boats/${data.boatId}`);
    
    return { 
      success: true, 
      booking,
      message: "Booking request submitted successfully"
    };
    
  } catch (error) {
    console.error("Booking request error:", error);
    
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return { 
        success: false, 
        error: "Invalid booking data", 
        fieldErrors: error.flatten().fieldErrors 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create booking request. Please try again." 
    };
  }
}

/**
 * Server action for form submissions
 */
export async function createBookingRequestAction(formData: FormData) {
  // Parse form data
  const data = {
    boatId: formData.get("boatId") as string,
    startDateTime: formData.get("startDateTime") as string,
    pricingTierId: formData.get("pricingTierId") as string,
    numberOfPassengers: parseInt(formData.get("numberOfPassengers") as string),
    needsCaptain: formData.get("needsCaptain") === "true",
    specialRequests: formData.get("specialRequests") as string,
  };

  return await createBookingRequest(data);
}

/**
 * Send GHL webhook for booking request
 * Calculates pricing from tier and boat data
 */
async function sendGHLWebhookForBookingRequest(
  booking: any,
  boat: any,
  pricingTier: any,
  startDateTime: Date,
  endDateTime: Date,
  user: any
) {
  try {
    // Calculate pricing from source data (use shared util for consistency)
    const { calculateBookingPriceFromDollars } = await import('@/shared/lib/utils/pricing-utils');
    const basePrice = pricingTier.price;
    const cleaningFee = boat.cleaningFee || 0;
    const priceBreakdown = calculateBookingPriceFromDollars(basePrice, cleaningFee, 0);
    const serviceFee = priceBreakdown.serviceFeeCents / 100;
    const totalAmount = priceBreakdown.totalPriceCents / 100;

    const ghlData = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phoneNumber || "",
      boat_name: boat.name,
      boat_id: boat.id,
      start_date_time: startDateTime.toISOString(),
      end_date_time: endDateTime.toISOString(),
      hours: String(pricingTier.hours || 0),
      number_of_passengers: String(booking.numberOfPassengers),
      needs_captain: booking.needsCaptain ? "true" : "false",
      base_price: String(basePrice),
      cleaning_fee: String(cleaningFee),
      service_fee: String(serviceFee.toFixed(2)),
      total_amount: String(totalAmount.toFixed(2)),
      booking_id: booking.id,
      booking_type: 'REQUEST',
      source: 'KOS Yacht Club - Booking Request',
      submitted_at: new Date().toISOString()
    };

    await ghlWebhookService.sendBookingRequest(ghlData);
    console.log("GHL webhook sent for booking request:", booking.id);
  } catch (error) {
    console.error("Error sending GHL webhook for booking request:", error);
  }
}
