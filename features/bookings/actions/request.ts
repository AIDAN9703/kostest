"use server";

import { db } from "@/database/db";
import { bookings, boats, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateEndDateTime } from "@/shared/utils/booking-utils";
import { eq } from "drizzle-orm";
import { calculateBookingPrice } from "@/shared/utils/pricing-utils";
import { ghlWebhookService } from "@/shared/services/ghl-webhook.service";

/**
 * Creates a booking request using pricing tiers
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
    
    // Get boat details for additional fees
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
    
    // Use the already calculated startDateTime and endDateTime from availability check
    
    // Calculate all fees using universal pricing function
    const priceBreakdown = calculateBookingPrice(
      pricingTier.price,
      boat.cleaningFee || 0,
      0 // Captain service is included in base price
    );
    
    // Create booking record
    const now = new Date();
    const booking = await db.insert(bookings).values({
      bookingType: "REQUEST",
      bookingStatus: "PENDING",
      userId: session.user.id,
      boatId: data.boatId,
      pricingTierId: validatedData.pricingTierId,
      
      // Customer information
      customerName: session.user.name || "",
      customerEmail: session.user.email || "",
      customerPhone: session.user.phoneNumber || "",
      
      // Booking details - NEW unified datetime fields
      isMultiDay: false,
      needsCaptain: validatedData.needsCaptain || boat.crewRequired,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      numberOfPassengers: validatedData.numberOfPassengers,
      
      // Pricing breakdown
      captainFee: priceBreakdown.captainFee,
      cleaningFee: priceBreakdown.cleaningFee,
      serviceFee: priceBreakdown.serviceFee,
      totalAmount: priceBreakdown.totalPrice,
      depositAmount: boat.depositAmount || 0,
      currency: "USD",
      
      // Initial payment status
      paymentStatus: "AWAITING_PAYMENT",
      
      // Set expiration for booking request (3 days)
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      
      // Timestamps
      createdAt: now,
      updatedAt: now
    }).returning();
    
    // Create conversation for this booking
    let conversationId: string | null = null;
    try {
      const { createBookingConversation } = await import("@/features/messaging/services/booking-integration");
      const conversationResult = await createBookingConversation(booking[0].id);
      conversationId = conversationResult?.conversationId || null;
    } catch (error) {
      console.error("Failed to create booking conversation:", error);
      // Don't fail the booking if conversation creation fails
    }
    
    // Send GHL webhook for booking request (async, don't block the response)
    sendGHLWebhookForBookingRequest(booking[0], boat, pricingTier, startDateTime, endDateTime, session.user).catch(error => {
      console.warn('GHL booking request webhook failed:', error);
    });

    // Revalidate relevant paths
    revalidatePath("/profile/bookings");
    revalidatePath(`/boats/${data.boatId}`);
    revalidatePath("/messages");
    
    return { 
      success: true, 
      booking: booking[0],
      conversationId: conversationId,
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
      base_price: String(pricingTier.price),
      cleaning_fee: String(booking.cleaningFee || 0),
      service_fee: String(booking.serviceFee || 0),
      total_amount: String(booking.totalAmount),
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
