"use server";

import { db } from "@/database/db";
import { bookings, boats, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema, BookingRequest } from "@/features/_validation/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateEndTime } from "@/shared/utils/booking-utils";
import { eq } from "drizzle-orm";

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
    
    // Calculate end time using the pricing tier hours
    const endTime = calculateEndTime(validatedData.startTime, pricingTier.hours);
    
    // Calculate all fees - captain service is included in base price
    const basePrice = pricingTier.price;
    const captainFee = 0; // Captain service is included in base price
    const cleaningFee = boat.cleaningFee || 0;
    const subtotal = basePrice + captainFee + cleaningFee;
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount;
    
    // Create booking record
    const now = new Date();
    const booking = await db.insert(bookings).values({
      bookingType: "DAY_REQUEST",
      bookingStatus: "PENDING",
      userId: session.user.id,
      boatId: data.boatId,
      pricingTierId: validatedData.pricingTierId,
      
      // Customer information
      customerName: session.user.name || "",
      customerEmail: session.user.email || "",
      customerPhone: session.user.phoneNumber || "",
      
      // Booking details
      isMultiDay: false,
      needsCaptain: validatedData.needsCaptain || boat.crewRequired,
      startDate: validatedData.startDate,
      startTime: validatedData.startTime,
      endTime: endTime,
      numberOfPassengers: validatedData.numberOfPassengers,
      specialRequests: validatedData.specialRequests || "",
      
      // Pricing breakdown
      captainFee: captainFee,
      cleaningFee: cleaningFee,
      serviceFee: 0,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      depositAmount: boat.depositAmount || 0,
      currency: "USD",
      
      // Initial payment status
      paymentStatus: "PENDING",
      
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
    startDate: new Date(formData.get("startDate") as string),
    startTime: formData.get("startTime") as string,
    pricingTierId: formData.get("pricingTierId") as string,
    numberOfPassengers: parseInt(formData.get("numberOfPassengers") as string),
    needsCaptain: formData.get("needsCaptain") === "true",
    specialRequests: formData.get("specialRequests") as string,
  };

  return await createBookingRequest(data);
} 