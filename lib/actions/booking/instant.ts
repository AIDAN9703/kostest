"use server";

import { db } from "@/database/db";
import { boats, bookings, bookingTypeEnum, bookingStatusEnum, boatPricingTiers } from "@/database/schema";
import { auth } from "@/auth";
import { bookingRequestSchema } from "@/lib/validation/validations";
import { redirect } from "next/navigation";
import { z } from "zod";
import { calculateBookingFees } from "../booking";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

/**
 * Creates a Stripe Checkout session for instant booking without creating a booking record yet
 * The actual booking will be created after payment success via webhook
 */
export async function createInstantBooking(data: z.infer<typeof bookingRequestSchema> & { boatId: string }) {
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
    
    // Get boat details to calculate pricing
    const boatResults = await db
      .select({
        id: boats.id,
        name: boats.name,
        cleaningFee: boats.cleaningFee, 
        depositAmount: boats.depositAmount,
        ownerId: boats.ownerId,
        instantBook: boats.instantBook,
        mainImage: boats.mainImage,
      })
      .from(boats)
      .where(eq(boats.id, data.boatId));
    
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
      .where(eq(boatPricingTiers.boatId, data.boatId));
    
    // Create a combined boat object with pricing tiers - this is how we handle relations
    const boat = {
      ...boatResults[0],
      pricingTiers: pricingTiers,
      // Add default tax rate since it's not in the schema
      taxRate: 0.08 // 8% default tax rate
    };
    
    // Verify boat allows instant booking
    if (!boat.instantBook) {
      return {
        success: false,
        error: "This boat does not support instant booking"
      };
    }
    
    // Calculate base price using pricing tiers
    const basePrice = calculatePriceFromTiers(boat, data.numberOfHours);
    
    // Calculate fees
    const fees = calculateBookingFees({
      basePrice,
      needsCaptain: data.needsCaptain,
      cleaningFee: boat.cleaningFee || 0,
    });
    
    // Create a Stripe Checkout Session
    // Instead of creating a booking record now, we'll store booking data in metadata
    // and create the actual booking record after successful payment via webhook
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${boat.name} - ${data.numberOfHours}hr Charter`,
              images: [boat.mainImage || "https://via.placeholder.com/800x600.png?text=Boat+Image"],
              description: `${data.needsCaptain ? "With Captain" : "Self-Drive"} - ${new Date(data.startDate).toLocaleDateString()} at ${data.startTime}`
            },
            unit_amount: Math.round(fees.totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        // Store all booking data needed to create a booking record after payment
        bookingType: "INSTANT_BOOK",
        boatId: boat.id,
        userId: session.user.id,
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phoneNumber || "",
        isMultiDay: "false",
        needsCaptain: data.needsCaptain.toString(),
        startDate: data.startDate.toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        numberOfHours: data.numberOfHours.toString(),
        numberOfPassengers: data.numberOfPassengers.toString(),
        specialRequests: data.specialRequests || "",
        basePrice: fees.basePrice.toString(),
        captainFee: fees.captainFee.toString(),
        cleaningFee: fees.cleaningFee.toString(),
        serviceFee: fees.serviceFee.toString(),
        taxAmount: fees.taxAmount.toString(),
        totalAmount: fees.totalAmount.toString(),
        depositAmount: (boat.depositAmount || 0).toString(),
        // Add timestamp for consistency
        createdAt: new Date().toISOString(),
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/boats/${boat.id}?canceled=true`,
    } as any);
    
    // Additionally, we can create a temporary booking record with pending status
    // This will be updated by the webhook after payment
    try {
      const now = new Date();
      await db.insert(bookings).values({
        bookingType: "INSTANT_BOOK",
        bookingStatus: "AWAITING_PAYMENT",
        userId: session.user.id,
        boatId: boat.id,
        
        // Customer information
        customerName: session.user.name || "",
        customerEmail: session.user.email || "",
        customerPhone: session.user.phoneNumber || "",
        
        // Booking details
        isMultiDay: false,
        needsCaptain: data.needsCaptain,
        startDate: data.startDate,
        startTime: data.startTime,
        endTime: data.endTime,
        numberOfHours: data.numberOfHours,
        numberOfPassengers: data.numberOfPassengers,
        specialRequests: data.specialRequests || "",
        
        // Pricing
        basePrice: fees.basePrice,
        captainFee: fees.captainFee,
        cleaningFee: fees.cleaningFee,
        serviceFee: fees.serviceFee,
        taxAmount: fees.taxAmount,
        totalAmount: fees.totalAmount,
        depositAmount: boat.depositAmount || 0,
        currency: "USD",
        
        // Payment information
        paymentStatus: "PENDING",
        paymentMethod: "card",
        stripePaymentLinkId: checkoutSession.id,
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
      });

      console.log("Created pending booking for session:", checkoutSession.id);
    } catch (error) {
      console.error("Error creating pending booking:", error);
      // Continue even if this fails - the webhook will create the booking
    }
    
    return { 
      success: true,
      paymentUrl: checkoutSession.url,
      message: "Redirecting to payment page."
    };
  } catch (error) {
    console.error("Instant booking error:", error);
    
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
      error: "Failed to create booking. Please try again." 
    };
  }
}

/**
 * Creates a Stripe checkout session and returns the result
 * This action is meant to be used by server components (form action)
 */
export async function createInstantBookingAction(formData: FormData) {
  // Auth check with redirect
  const session = await auth();
  if (!session?.user) {
    // Return response instead of redirecting
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

  // Let the component handle the redirect based on the returned data
  return await createInstantBooking(data);
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