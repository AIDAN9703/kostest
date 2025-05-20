"use server";

import { db } from "@/database/db";
import { bookings, bookingTypeEnum, bookingStatusEnum, boats, users, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema } from "@/lib/validation/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateBookingFees } from "../booking";
import { eq, sql, and, desc, asc } from "drizzle-orm";

/**
 * Creates a booking request for a day rental
 * This is used for the standard booking request flow that requires owner approval
 */
export async function createBookingRequest(data: z.infer<typeof bookingRequestSchema> & { boatId: string }) {
  // Check for authentication - this is the sole auth check needed
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
    
    // Calculate pricing
    const { numberOfHours, needsCaptain, boatId } = data;
    
    // Get boat details to calculate pricing
    const boatResults = await db
      .select({
        cleaningFee: boats.cleaningFee, 
        depositAmount: boats.depositAmount,
        ownerId: boats.ownerId
      })
      .from(boats)
      .where(eq(boats.id, boatId));
    
    if (boatResults.length === 0) {
      return { 
        success: false, 
        error: "Boat not found" 
      };
    }
    
    // Get pricing tiers in separate query - professional pattern for relational data
    const pricingTiers = await db
      .select()
      .from(boatPricingTiers)
      .where(eq(boatPricingTiers.boatId, boatId));
    
    // Create a combined boat object with pricing tiers
    const boat = {
      ...boatResults[0],
      pricingTiers: pricingTiers,
      // Default tax rate if not in database
      taxRate: 0.08
    };
    
    // Calculate base price using pricing tiers instead of hourlyRate
    const basePrice = calculatePriceFromTiers(boat, numberOfHours);
    
    // Calculate fees
    const fees = calculateBookingFees({
      basePrice,
      needsCaptain,
      cleaningFee: boat.cleaningFee || 0,
      taxRate: boat.taxRate || 0.08
    });
    
    // Create a new Date object for consistent timestamp format
    const now = new Date();
    
    // Create booking record
    const booking = await db.insert(bookings).values({
      bookingType: "DAY_REQUEST",
      bookingStatus: "PENDING",
      userId: session.user.id,
      boatId: boatId,
      
      // Customer information
      customerName: session.user.name || "",
      customerEmail: session.user.email || "",
      customerPhone: session.user.phoneNumber || "",
      
      // Booking details
      isMultiDay: false,
      needsCaptain: needsCaptain,
      startDate: validatedData.startDate,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      numberOfHours: validatedData.numberOfHours,
      numberOfPassengers: validatedData.numberOfPassengers,
      specialRequests: validatedData.specialRequests || "",
      
      // Pricing
      basePrice: fees.basePrice,
      captainFee: fees.captainFee,
      cleaningFee: fees.cleaningFee,
      serviceFee: fees.serviceFee,
      taxAmount: fees.taxAmount,
      totalAmount: fees.totalAmount,
      depositAmount: boat.depositAmount || 0,
      currency: "USD",
      
      // Initial payment status
      paymentStatus: "PENDING",
      
      // Set expiration for booking request (3 days)
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      
      // Explicitly set timestamps for consistency
      createdAt: now,
      updatedAt: now
    }).returning();
    
    // Update user's booking count
    await db.execute(
      sql`UPDATE "user" SET total_bookings = COALESCE(total_bookings, 0) + 1, updated_at = NOW() WHERE id = ${session.user.id}`
    );
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/bookings");
    revalidatePath(`/boats/${boatId}`);
    
    return { 
      success: true, 
      booking: booking[0],
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
 * Creates a booking request and returns the result
 * This action is meant to be used by server components (form action)
 */
export async function createBookingRequestAction(formData: FormData) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return { 
      success: false, 
      error: "You must be signed in to book", 
      errorType: "AUTH"
    };
  }

  // Parse form data
  const data = {
    boatId: formData.get("boatId") as string,
    startDate: new Date(formData.get("startDate") as string),
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    numberOfHours: parseInt(formData.get("numberOfHours") as string),
    numberOfPassengers: parseInt(formData.get("numberOfPassengers") as string),
    needsCaptain: formData.get("needsCaptain") === "true",
    specialRequests: formData.get("specialRequests") as string,
  };

  // Let the component handle the redirect based on the returned result
  return await createBookingRequest(data);
}

// Helper function to calculate price from tiers
function calculatePriceFromTiers(boat: any, hours: number) {
  if (!boat.pricingTiers || boat.pricingTiers.length === 0) return 0;
  
  // Find an exact match for the number of hours
  const exactTier = boat.pricingTiers.find((tier: any) => tier.hours === hours && tier.isActive);
  if (exactTier) return exactTier.price;
  
  // If no exact match, find the closest tier (prefer higher tier)
  const sortedTiers = [...boat.pricingTiers]
    .filter((tier: any) => tier.isActive)
    .sort((a: any, b: any) => a.hours - b.hours);
  
  // Find the closest tier that covers the requested hours
  const closestTier = sortedTiers.find((tier: any) => tier.hours >= hours);
  if (closestTier) return closestTier.price;
  
  // If no higher tier is found, use the highest available tier
  return sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].price : 0;
} 